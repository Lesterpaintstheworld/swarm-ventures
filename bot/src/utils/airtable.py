from pyairtable import Table
from datetime import datetime
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
            "status": "free"
        })
        
    def update_user_status(self, telegram_id: str, status: str):
        """Update user subscription status"""
        user = self.get_user(telegram_id)
        if user:
            self.table.update(user['id'], {
                'status': status,
                'subscription_updated': datetime.now().isoformat()
            })
            return True
        return False

    def get_subscription_status(self, telegram_id: str) -> str:
        """Get user's subscription status"""
        user = self.get_user(telegram_id)
        if user:
            return user['fields'].get('status', 'free')
        return 'free'
