from fastapi import FastAPI, Request, Response
from telegram import Update
from telegram.ext import Application
import json
import os
from dotenv import load_dotenv
from src.services.claude_client import ClaudeClient
from src.utils.airtable import AirtableClient

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Initialize bot application
application = Application.builder().token(os.getenv('TELEGRAM_BOT_TOKEN')).build()

@app.post("/api/telegram")
async def telegram_webhook(request: Request):
    """Handle incoming webhook updates from Telegram"""
    try:
        # Get the update data
        data = await request.json()
        update = Update.de_json(data, application.bot)
        
        # Only process text messages
        if update.message and update.message.text:
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
