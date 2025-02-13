import json
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
        """Create new user"""
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
        user = self.get_user(telegram_id)
        if not user:
            return None
            
        try:
            watchlist = json.loads(user['fields'].get('watchlist', '[]'))
            swarm_id = swarm_id.lower()
            if swarm_id not in watchlist:
                watchlist.append(swarm_id)
                return self.table.update(user['id'], {'watchlist': json.dumps(watchlist)})
            return user
        except json.JSONDecodeError:
            # If watchlist is invalid JSON, start fresh
            return self.table.update(user['id'], {'watchlist': json.dumps([swarm_id.lower()])})

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
