from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
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

# Model for swarm information
class SwarmInfo(BaseModel):
    id: str
    name: str
    image: str

# Model for listing information
class ListingInfo(BaseModel):
    id: str
    seller: str
    numberOfShares: int
    pricePerShare: float
    desiredToken: str

# Model for new listing notifications
class NewListingNotification(BaseModel):
    listing: ListingInfo
    swarm: SwarmInfo

    class Config:
        json_schema_extra = {
            "example": {
                "listing": {
                    "id": "L123456",
                    "seller": "ABC...XYZ",
                    "numberOfShares": 100,
                    "pricePerShare": 10.5,
                    "desiredToken": "USDC"
                },
                "swarm": {
                    "id": "kinos",
                    "name": "Kinos",
                    "image": "https://example.com/image.jpg"
                }
            }
        }

# Model for completed sale notifications
class SaleNotification(BaseModel):
    swarm_id: str
    number_of_shares: int
    price_per_share: float
    seller: str
    buyer: str
    total_price: float
    token: str = Field(description="Token symbol (e.g., 'USDC')")

    class Config:
        json_schema_extra = {
            "example": {
                "swarm_id": "kinos",
                "number_of_shares": 100,
                "price_per_share": 10.5,
                "seller": "ABC...XYZ",
                "buyer": "DEF...UVW",
                "total_price": 1050.0,
                "token": "USDC"
            }
        }

@app.post("/api/notify-new-listing")
async def notify_new_listing(notification: NewListingNotification):
    try:
        notification_dict = notification.model_dump()
        print(json.dumps({
            "timestamp": datetime.now().isoformat(),
            "event": "new_listing_received",
            "listing_data": notification_dict
        }, indent=2))

        # Create listing in Airtable
        from utils.airtable import AirtableClient
        airtable = AirtableClient()
        
        try:
            await airtable.createListing(notification_dict)
        except Exception as e:
            print(f"Error creating listing in Airtable: {e}")
            # Continue with notifications even if Airtable creation fails

        # Format notification message
        message = (
            "🔔 New Listing Available!\n\n"
            f"Swarm: {notification.swarm.name}\n"
            f"Shares: {notification.listing.numberOfShares:,}\n"
            f"Price/Share: {notification.listing.pricePerShare:,.2f} {notification.listing.desiredToken}\n"
            f"Seller: {notification.listing.seller}\n\n"
            f"Listing ID: {notification.listing.id}\n\n"
            f"🔗 View Listing: https://swarms.universalbasiccompute.ai/invest/{notification.swarm.id}"
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

@app.post("/api/notify-sale")
async def notify_sale(notification: SaleNotification):
    try:
        notification_dict = notification.model_dump()
        print(json.dumps({
            "timestamp": datetime.now().isoformat(),
            "event": "sale_completed",
            "sale_data": notification_dict
        }, indent=2))

        # Format notification message
        message = (
            "💰 Sale Completed!\n\n"
            f"Swarm: {notification.swarm_id}\n"
            f"Shares: {notification.number_of_shares:,}\n"
            f"Price/Share: {notification.price_per_share:,.2f} {notification.token}\n"
            f"Total: {notification.total_price:,.2f} {notification.token}\n"
            f"Seller: {notification.seller}\n"
            f"Buyer: {notification.buyer}"
        )

        # Get all users from Airtable
        airtable = AirtableClient()
        users = airtable.get_all_users()

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
            except Exception as e:
                failed_notifications.append({
                    "telegram_id": telegram_id,
                    "error": str(e)
                })

        # Send all notifications concurrently
        if notification_tasks:
            results = await asyncio.gather(*notification_tasks, return_exceptions=True)
            success_count = sum(1 for r in results if not isinstance(r, Exception))
            failure_count = sum(1 for r in results if isinstance(r, Exception))

        return {
            "status": "success",
            "notifications_sent": len(notification_tasks),
            "successful_notifications": success_count,
            "failed_notifications": failure_count,
            "failures": failed_notifications
        }

    except Exception as e:
        error_data = {
            "timestamp": datetime.now().isoformat(),
            "event": "sale_notification_error",
            "error": str(e),
            "error_type": type(e).__name__
        }
        print(json.dumps(error_data, indent=2))
        raise HTTPException(status_code=500, detail=str(e))
