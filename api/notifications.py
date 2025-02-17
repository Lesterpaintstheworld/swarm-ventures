from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import telegram
import asyncio
import os
import json
from dotenv import load_dotenv
from api.airtable import AirtableClient

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Initialize Telegram bot
bot = telegram.Bot(token=os.getenv('TELEGRAM_BOT_TOKEN'))

class Token(BaseModel):
    label: str
    icon: str = "/tokens/usdc.svg"

class ListingNotification(BaseModel):
    swarm_id: str
    number_of_shares: int
    price_per_share: float
    seller: str
    total_price: float
    listing_id: str
    token: Token = Token(label="USDC", icon="/tokens/usdc.svg")

@app.post("/api/notify-new-listing")
async def notify_new_listing(listing: ListingNotification):
    try:
        print(json.dumps({
            "timestamp": datetime.now().isoformat(),
            "event": "new_listing_received",
            "listing_data": listing.dict()  # Use .dict() instead of direct access
        }, indent=2))

        # Create listing in Airtable
        from utils.airtable import AirtableClient
        airtable = AirtableClient()
        
        try:
            await airtable.createListing(listing.dict())
        except Exception as e:
            print(f"Error creating listing in Airtable: {e}")
            # Continue with notifications even if Airtable creation fails

        # Format notification message
        message = (
            "🔔 New Listing Alert!\n\n"
            f"Swarm: {listing.swarm_id.upper()}\n"
            f"Shares: {listing.number_of_shares:,}\n"
            f"Price/Share: {listing.price_per_share:,.2f} {listing.token.label}\n"
            f"Total Price: {listing.total_price:,.2f} {listing.token.label}\n"
            f"Seller: {listing.seller}\n\n"
            f"Listing ID: {listing.listing_id}\n\n"
            f"🔗 View Listing: https://swarms.universalbasiccompute.ai/invest/{listing.swarm_id}"
        )

        print(json.dumps({
            "timestamp": datetime.now().isoformat(),
            "event": "notification_message_formatted",
            "message": message
        }, indent=2))

        # Get all users from Airtable
        airtable = AirtableClient()
        users = airtable.get_all_users()

        print(json.dumps({
            "timestamp": datetime.now().isoformat(),
            "event": "fetched_users",
            "user_count": len(users)
        }, indent=2))

        # Send notification to all users
        notification_tasks = []
        failed_notifications = []
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
                    print(json.dumps({
                        "timestamp": datetime.now().isoformat(),
                        "event": "notification_queued",
                        "telegram_id": telegram_id,
                        "username": user['fields'].get('username', 'unknown')
                    }, indent=2))
                else:
                    print(json.dumps({
                        "timestamp": datetime.now().isoformat(),
                        "event": "skip_notification",
                        "reason": "no_telegram_id",
                        "user_id": user['id']
                    }, indent=2))
            except Exception as e:
                failed_notifications.append({
                    "telegram_id": telegram_id,
                    "error": str(e)
                })
                print(json.dumps({
                    "timestamp": datetime.now().isoformat(),
                    "event": "notification_preparation_error",
                    "telegram_id": telegram_id,
                    "error": str(e)
                }, indent=2))

        # Send all notifications concurrently
        if notification_tasks:
            print(json.dumps({
                "timestamp": datetime.now().isoformat(),
                "event": "sending_notifications",
                "total_notifications": len(notification_tasks)
            }, indent=2))

            results = await asyncio.gather(*notification_tasks, return_exceptions=True)
            
            # Log success and failures from the results
            success_count = sum(1 for r in results if not isinstance(r, Exception))
            failure_count = sum(1 for r in results if isinstance(r, Exception))
            
            print(json.dumps({
                "timestamp": datetime.now().isoformat(),
                "event": "notifications_complete",
                "success_count": success_count,
                "failure_count": failure_count,
                "failed_notifications": [
                    {
                        "error": str(r)
                    } for r in results if isinstance(r, Exception)
                ]
            }, indent=2))

        response_data = {
            "status": "success",
            "notifications_sent": len(notification_tasks),
            "successful_notifications": success_count,
            "failed_notifications": failure_count,
            "failures": failed_notifications
        }

        print(json.dumps({
            "timestamp": datetime.now().isoformat(),
            "event": "request_complete",
            "response": response_data
        }, indent=2))

        return response_data

    except Exception as e:
        error_data = {
            "timestamp": datetime.now().isoformat(),
            "event": "notification_error",
            "error": str(e),
            "error_type": type(e).__name__
        }
        print(json.dumps(error_data, indent=2))
        raise HTTPException(status_code=500, detail=str(e))
