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
            "watchlist": []
        })

    def add_to_watchlist(self, telegram_id: str, symbol: str):
        """Add token to user's watchlist"""
        user = self.get_user(telegram_id)
        if not user:
            return None
            
        watchlist = user['fields'].get('watchlist', [])
        if symbol not in watchlist:
            watchlist.append(symbol)
            return self.table.update(user['id'], {'watchlist': watchlist})
        return user

    def remove_from_watchlist(self, telegram_id: str, symbol: str):
        """Remove token from user's watchlist"""
        user = self.get_user(telegram_id)
        if not user:
            return None
            
        watchlist = user['fields'].get('watchlist', [])
        if symbol in watchlist:
            watchlist.remove(symbol)
            return self.table.update(user['id'], {'watchlist': watchlist})
        return user
