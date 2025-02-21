from pyairtable import Table
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

class AirtableClient:
    def __init__(self):
        self.table = Table(
            os.getenv('AIRTABLE_API_KEY'),
            os.getenv('AIRTABLE_BASE_ID'),
            os.getenv('AIRTABLE_TABLE_NAME')
        )
        self.listings_table = Table(
            os.getenv('AIRTABLE_API_KEY'),
            os.getenv('AIRTABLE_BASE_ID'),
            'Listings'  # Table des listings
        )
    
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

    async def update_listing_sold(self, listing_id: str):
        """Update listing with sold date when sale is completed"""
        try:
            # Recherche le listing par son ID
            records = self.listings_table.all(formula=f"{{listing_id}}='{listing_id}'")
            if records:
                # Met à jour avec la date de vente
                self.listings_table.update(records[0]['id'], {
                    'dateSold': datetime.now().isoformat(),
                    'status': 'sold'
                })
                return True
            return False
        except Exception as e:
            print(f"Error updating listing sold status: {e}")
            return False

    def get_subscription_status(self, telegram_id: str) -> str:
        """Get user's subscription status"""
        user = self.get_user(telegram_id)
        if user:
            return user['fields'].get('status', 'free')
        return 'free'
        
    def update_payment_details(self, telegram_id: str, details: dict):
        """Update payment details for user"""
        user = self.get_user(telegram_id)
        if user:
            self.table.update(user['id'], {
                'payment_date': details['payment_date'],
                'payment_amount': details['amount_paid'],
                'transaction_id': details['transaction_signature'],
                'payment_status': details['payment_status']
            })
            return True
        return False
