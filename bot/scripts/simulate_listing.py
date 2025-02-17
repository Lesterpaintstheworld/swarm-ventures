import random
import asyncio
import json
from datetime import datetime
import os
import sys

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from pydantic import BaseModel, Field
import telegram
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Telegram bot
bot = telegram.Bot(token=os.getenv('TELEGRAM_BOT_TOKEN'))

# Define the ListingNotification model
class ListingNotification(BaseModel):
    swarm_id: str
    number_of_shares: int
    price_per_share: float
    seller: str
    total_price: float
    listing_id: str
    token: str = Field(description="Token symbol (e.g., 'USDC')")

async def simulate_listing():
    # Available swarms for simulation
    swarms = ['kinos', 'xforge', 'kinkong']
    
    # Generate random listing data
    listing_data = {
        "swarm_id": random.choice(swarms),
        "number_of_shares": random.randint(10, 1000),
        "price_per_share": round(random.uniform(10, 15), 2),
        "seller": "ABC...XYZ",
        "listing_id": f"L{random.randint(100000, 999999)}",
        "token": "USDC"
    }
    
    # Calculate total price
    listing_data["total_price"] = round(listing_data["number_of_shares"] * listing_data["price_per_share"], 2)

    # Print the simulated listing
    print("\nSimulating listing:")
    print(json.dumps(listing_data, indent=2))

    try:
        # Create ListingNotification instance
        listing = ListingNotification(**listing_data)
        
        # Format notification message
        message = (
            "🔔 New Listing Alert!\n\n"
            f"Swarm: {listing_data['swarm_id'].upper()}\n"
            f"Shares: {listing_data['number_of_shares']:,}\n"
            f"Price/Share: {listing_data['price_per_share']:,.2f} {listing_data['token']}\n"
            f"Total Price: {listing_data['total_price']:,.2f} {listing_data['token']}\n"
            f"Seller: {listing_data['seller']}\n\n"
            f"Listing ID: {listing_data['listing_id']}\n\n"
            f"🔗 View Listing: https://swarms.universalbasiccompute.ai/invest/{listing_data['swarm_id']}"
        )

        print("\nFormatted Message:")
        print(message)

        # Create listing in Airtable
        from utils.airtable import AirtableClient
        airtable = AirtableClient()
        
        try:
            await airtable.createListing(listing_data)
            print("\nListing created in Airtable successfully")
        except Exception as e:
            print(f"\nError creating listing in Airtable: {e}")

        # Get all users from Airtable
        users = airtable.get_all_users()
        notifications_sent = 0

        # Send notification to all users
        for user in users:
            try:
                telegram_id = user['fields'].get('telegram_id')
                if telegram_id:
                    await bot.send_message(
                        chat_id=telegram_id,
                        text=message,
                        parse_mode='HTML'
                    )
                    notifications_sent += 1
            except Exception as e:
                print(f"Error sending notification to {telegram_id}: {e}")

        print(f"\nNotifications sent: {notifications_sent}")
            
    except Exception as e:
        print(f"\nError: {e}")

async def simulate_multiple_listings(count=5, delay_seconds=10):
    for i in range(count):
        print(f"\nSimulating listing {i+1} of {count}")
        await simulate_listing()
        if i < count - 1:  # Don't delay after the last one
            print(f"\nWaiting {delay_seconds} seconds...")
            await asyncio.sleep(delay_seconds)

if __name__ == "__main__":
    asyncio.run(simulate_multiple_listings())
