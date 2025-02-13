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
            # If user doesn't exist, create them
            user = self.create_user(telegram_id, "")
            if not user:
                return None
                
        try:
            watchlist = json.loads(user['fields'].get('watchlist', '[]'))
            swarm_id = swarm_id.lower()
            if swarm_id not in watchlist:
                watchlist.append(swarm_id)
                result = self.table.update(user['id'], {'watchlist': json.dumps(watchlist)})
                logging.info(f"Updated watchlist for user {telegram_id}: {watchlist}")
                return result
            return user
        except json.JSONDecodeError as e:
            logging.error(f"JSON decode error: {e}")
            # If watchlist is invalid JSON, start fresh
            result = self.table.update(user['id'], {'watchlist': json.dumps([swarm_id.lower()])})
            logging.info(f"Created new watchlist for user {telegram_id}: [{swarm_id}]")
            return result
        except Exception as e:
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
