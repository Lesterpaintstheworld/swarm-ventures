from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import telegram
import asyncio
import os
from dotenv import load_dotenv
from src.utils.airtable import AirtableClient

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Initialize Telegram bot
bot = telegram.Bot(token=os.getenv('TELEGRAM_BOT_TOKEN'))

class ListingNotification(BaseModel):
    swarm_id: str
    number_of_shares: int
    price_per_share: float
    seller: str
    total_price: float
    listing_id: str
    token: Optional[dict] = {
        "label": "$COMPUTE",
        "icon": "/tokens/compute.svg"
    }

@app.post("/api/notify-new-listing")
async def notify_new_listing():
    try:
        # Mock listing data for testing
        mock_listing = {
            "swarm_id": "xforge",
            "number_of_shares": 1000,
            "price_per_share": 404.3,
            "seller": "ABC...XYZ",
            "total_price": 404300,
            "listing_id": "L123456",
            "token": {
                "label": "$COMPUTE",
                "icon": "/tokens/compute.svg"
            }
        }

        # Format notification message
        message = (
            "🔔 New Listing Alert!\n\n"
            f"Swarm: {mock_listing['swarm_id'].upper()}\n"
            f"Shares: {mock_listing['number_of_shares']:,}\n"
            f"Price/Share: {mock_listing['price_per_share']:,.2f} {mock_listing['token']['label']}\n"
            f"Total Price: {mock_listing['total_price']:,.2f} {mock_listing['token']['label']}\n"
            f"Seller: {mock_listing['seller']}\n\n"
            f"Listing ID: {mock_listing['listing_id']}\n\n"
            f"🔗 View Listing: https://swarms.universalbasiccompute.ai/invest/{mock_listing['swarm_id']}"
        )

        # Get all users from Airtable
        airtable = AirtableClient()
        users = airtable.get_all_users()  # You'll need to add this method to AirtableClient

        # Send notification to all users
        notification_tasks = []
        for user in users:
            try:
                telegram_id = user['fields'].get('telegram_id')
                if telegram_id:
                    notification_tasks.append(
                        bot.send_message(
                            chat_id=telegram_id,
                            text=message,
                            parse_mode='HTML'
                        )
                    )
            except Exception as e:
                print(f"Error preparing notification for user {telegram_id}: {e}")

        # Send all notifications concurrently
        if notification_tasks:
            await asyncio.gather(*notification_tasks, return_exceptions=True)

        return {"status": "success", "notifications_sent": len(notification_tasks)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending notifications: {str(e)}")
