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
        
    def get_all_users(self):
        """Get all users from Airtable"""
        try:
            return self.table.all()
        except Exception as e:
            print(f"Error fetching users from Airtable: {e}")
            return []
            
    async def createListing(self, listing_data):
        """Create a new listing in Airtable"""
        try:
            # Create a new table instance for listings
            listings_table = Table(
                os.getenv('AIRTABLE_API_KEY'),
                os.getenv('AIRTABLE_BASE_ID'),
                'Listings'  # Use the Listings table
            )
            
            # Format the listing data for Airtable
            fields = {
                'id': listing_data['listing_id'],
                'swarm_id': listing_data['swarm_id'],
                'number_of_shares': listing_data['number_of_shares'],
                'price_per_share': listing_data['price_per_share'],
                'total_price': listing_data['total_price'],
                'seller_wallet': listing_data['seller'],
                'listing_date': datetime.now().isoformat(),
                'status': 'active',
                'token_type': listing_data['token']
            }
            
            # Create the record
            record = listings_table.create(fields)
            return record
            
        except Exception as e:
            print(f"Error creating listing in Airtable: {e}")
            raise e
