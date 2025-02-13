import json
import logging
from pyairtable import Table
from src.config.settings import AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME

class AirtableClient:
    def __init__(self):
        self.table = Table(AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME)
    
    def get_user(self, telegram_id: str):
        """Get user by Telegram ID"""
        records = self.table.all(formula=f"{{telegram_id}}='{telegram_id}'")
        return records[0] if records else None
    
    def create_user(self, telegram_id: str, username: str):
        """Create new user if doesn't exist"""
        existing_user = self.get_user(telegram_id)
        if existing_user:
            return existing_user
            
        return self.table.create({
            "telegram_id": telegram_id,
            "username": username,
            "status": "active",
            "watchlist": json.dumps([]),  # Empty JSON array
            "alert_preferences": json.dumps({
                "price_change": 5,  # 5% threshold
                "new_shares": True,
                "announcements": True
            })
        })

    def add_to_watchlist(self, telegram_id: str, swarm_id: str):
        """Add swarm to user's watchlist"""
        # Ensure user exists
        user = self.get_user(telegram_id)
        if not user:
            user = self.create_user(telegram_id, "")
            if not user:
                return None
                
        try:
            watchlist = json.loads(user['fields'].get('watchlist', '[]'))
            swarm_count = user['fields'].get('swarm_count', 0)
            
            # Check if user has reached limit and isn't subscribed
            if swarm_count >= 2 and user['fields'].get('status') != 'subscribed':
                raise Exception("FREE_TRIAL_LIMIT_REACHED")
                
            # swarm_id is already in combined format (e.g., "kinkong_USDT")
            if swarm_id not in watchlist:
                watchlist.append(swarm_id)
                swarm_count += 1
                
                # Add warning flag if on last free slot
                warning_message = None
                if swarm_count == 1:
                    warning_message = "FINAL_FREE_SLOT"
                
                result = self.table.update(user['id'], {
                    'watchlist': json.dumps(watchlist),
                    'swarm_count': swarm_count
                })
                
                logging.info(f"Updated watchlist for user {telegram_id}: {watchlist}")
                return {
                    'result': result,
                    'warning': warning_message,
                    'swarms_remaining': 2 - swarm_count
                }
            return user
            
        except Exception as e:
            if str(e) == "FREE_TRIAL_LIMIT_REACHED":
                logging.info(f"Free trial limit reached for user {telegram_id}")
                return {
                    'error': 'FREE_TRIAL_LIMIT_REACHED',
                    'message': "You've reached your free trial limit of 2 swarms. Please subscribe to add more swarms."
                }
            logging.error(f"Error updating watchlist: {e}")
            return None

    def remove_from_watchlist(self, telegram_id: str, swarm_id: str):
        """Remove swarm from user's watchlist"""
        user = self.get_user(telegram_id)
        if not user:
            return None
            
        try:
            watchlist = json.loads(user['fields'].get('watchlist', '[]'))
            swarm_id = swarm_id.lower()
            if swarm_id in watchlist:
                watchlist.remove(swarm_id)
                return self.table.update(user['id'], {'watchlist': json.dumps(watchlist)})
            return user
        except json.JSONDecodeError:
            # If watchlist is invalid JSON, start fresh
            return self.table.update(user['id'], {'watchlist': json.dumps([])})
            
    def get_all_users(self):
        """Get all active users"""
        return self.table.all(formula="{status}='active'")
