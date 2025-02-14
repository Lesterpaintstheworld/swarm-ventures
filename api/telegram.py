import sys
import os
from pathlib import Path

# Add the project root to Python path
project_root = str(Path(__file__).parent.parent)
if project_root not in sys.path:
    sys.path.append(project_root)

from fastapi import FastAPI, Request, Response, HTTPException
from datetime import datetime, timedelta
from telegram import Update
from telegram.ext import Application
import json
from dotenv import load_dotenv
from src.services.claude_client import ClaudeClient
from src.utils.airtable import AirtableClient
from src.bot.commands import start_command, help_command, watchlist_command

# Load environment variables
load_dotenv()

# Initialize rate limiting
rate_limit_store = {}

def check_rate_limit(user_id: str, limit: int = 30):
    """Check if user has exceeded rate limit"""
    now = datetime.now()
    if user_id in rate_limit_store:
        # Remove requests older than 1 minute
        rate_limit_store[user_id] = [
            t for t in rate_limit_store[user_id] 
            if now - t < timedelta(minutes=1)
        ]
        if len(rate_limit_store[user_id]) >= limit:
            raise HTTPException(
                status_code=429, 
                detail="Too many requests. Please wait a minute."
            )
    rate_limit_store.setdefault(user_id, []).append(now)

# Initialize FastAPI app
app = FastAPI()

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    print(f"Request processed in {process_time:.2f} seconds")
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Initialize bot application
application = Application.builder().token(os.getenv('TELEGRAM_BOT_TOKEN')).build()

@app.get("/")
async def root():
    """Root endpoint for health checks"""
    return {"status": "ok"}

@app.on_event("startup")
async def startup():
    """Set webhook on startup"""
    webhook_url = f"{os.getenv('VERCEL_URL', 'https://swarm-ventures.vercel.app')}/api/telegram"
    try:
        await application.bot.set_webhook(webhook_url)
        print(f"Webhook set to {webhook_url}")
    except Exception as e:
        print(f"Failed to set webhook: {e}")

@app.on_event("shutdown")
async def shutdown():
    """Remove webhook on shutdown"""
    try:
        await application.bot.delete_webhook()
        print("Webhook removed")
    except Exception as e:
        print(f"Failed to remove webhook: {e}")
from src.services.claude_client import ClaudeClient
from src.utils.airtable import AirtableClient
from src.bot.commands import start_command, help_command, watchlist_command

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Initialize bot application
application = Application.builder().token(os.getenv('TELEGRAM_BOT_TOKEN')).build()

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Global error: {exc}")
    return Response(
        status_code=500,
        content=json.dumps({"error": str(exc)})
    )

@app.post("/api/telegram")
async def telegram_webhook(request: Request):
    """Handle incoming webhook updates from Telegram"""
    try:
        # Get and log the update data
        data = await request.json()
        print(f"Received webhook data: {json.dumps(data, indent=2)}")
        update = Update.de_json(data, application.bot)
        
        # Handle commands first
        if update.message and update.message.text:
            if update.message.text.startswith('/'):
                command = update.message.text.split()[0].lower()
                if command == '/start':
                    await start_command(update, None)
                    return Response(status_code=200)
                elif command == '/help':
                    await help_command(update, None)
                    return Response(status_code=200)
                elif command == '/watchlist':
                    await watchlist_command(update, None)
                    return Response(status_code=200)
                    
            # Process non-command messages
            # Initialize clients
            claude = ClaudeClient()
            airtable = AirtableClient()
            
            # Store user message
            user_message = {
                'role': 'user',
                'content': update.message.text
            }
            airtable.store_message(str(update.message.from_user.id), user_message)
            
            # Get user data from Airtable
            user_data = airtable.get_user(str(update.message.from_user.id))
            
            # Get Claude's response
            response = await claude.get_response(
                user_message=update.message.text,
                user_data=user_data
            )
            
            # Store assistant response
            assistant_message = {
                'role': 'assistant',
                'content': response['user_response']
            }
            airtable.store_message(str(update.message.from_user.id), assistant_message)
            
            # Send Claude's response
            await update.message.reply_text(response['user_response'])
            
            # Execute Airtable operation if present
            if response.get('airtable_op'):
                op = response['airtable_op']
                if op['operation'] == 'add_to_watchlist':
                    result = airtable.add_to_watchlist(
                        telegram_id=str(update.message.from_user.id),
                        swarm_id=op['params']['swarm_id']
                    )
                    # Get fresh user data after operation
                    user_data = airtable.get_user(str(update.message.from_user.id))
            
            # Send status message
            try:
                watchlist = json.loads(user_data['fields'].get('watchlist', '[]'))
                alert_prefs = json.loads(user_data['fields'].get('alert_preferences', '{}'))
                preferences = json.loads(user_data['fields'].get('preferences', '{}'))
                
                status_msg = "📊 Current Status:\n\n"
                status_msg += f"Status: {user_data['fields'].get('status', 'free')}\n\n"
                status_msg += "📋 Watchlist:\n"
                if watchlist:
                    for swarm in watchlist:
                        try:
                            swarm_name, token = swarm.split('_')
                            status_msg += f"• {swarm_name.upper()} ({token.upper()})\n"
                        except ValueError:
                            status_msg += f"• {swarm}\n"
                else:
                    status_msg += "• No swarms in watchlist\n"
                
                status_msg += "\n⚡ Alert Preferences:\n"
                status_msg += f"• Price changes: {alert_prefs.get('price_change', 5)}%\n"
                status_msg += f"• New shares: {'Yes' if alert_prefs.get('new_shares', True) else 'No'}\n"
                status_msg += f"• Announcements: {'Yes' if alert_prefs.get('announcements', True) else 'No'}\n"
                
                if preferences.get('investment_style') or preferences.get('risk_tolerance'):
                    status_msg += "\n🎯 Preferences:\n"
                    if preferences.get('investment_style'):
                        status_msg += f"• Style: {preferences['investment_style']}\n"
                    if preferences.get('risk_tolerance'):
                        status_msg += f"• Risk: {preferences['risk_tolerance']}\n"
                    if preferences.get('preferred_tiers'):
                        status_msg += f"• Preferred tiers: {', '.join(preferences['preferred_tiers'])}\n"
                
                await update.message.reply_text(status_msg)
                
            except Exception as e:
                print(f"Error sending status message: {e}")
        
        return Response(status_code=200)
        
    except Exception as e:
        print(f"Error processing update: {e}")
        return Response(status_code=500)

@app.get("/api/telegram")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}
