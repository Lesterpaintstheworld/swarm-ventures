import logging
import os
import asyncio
import json
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, CallbackQueryHandler, MessageHandler, filters, ContextTypes
from src.services.monitor import SwarmMonitor
from src.services.claude_client import ClaudeClient
from src.utils.airtable import AirtableClient

from src.bot.commands import (
    start_command,
    help_command
)

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle all messages with Claude"""
    # Only respond to direct messages (positive chat IDs)
    if update.effective_chat.id < 0:
        return
        
    # Initialize clients
    claude = ClaudeClient()
    airtable = AirtableClient()
    
    # Store user message
    user_message = {
        'role': 'user',
        'content': update.message.text
    }
    airtable.store_message(str(update.effective_user.id), user_message)
    
    # Get user data from Airtable
    user_data = airtable.get_user(str(update.effective_user.id))
    
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
    airtable.store_message(str(update.effective_user.id), assistant_message)
    
    # Send Claude's response first
    await update.message.reply_text(response['user_response'])
    
    # Execute Airtable operation if present
    if response.get('airtable_op'):
        op = response['airtable_op']
        if op['operation'] == 'add_to_watchlist':
            result = airtable.add_to_watchlist(
                telegram_id=str(update.effective_user.id),
                swarm_id=op['params']['swarm_id']
            )
            # Get fresh user data after operation
            user_data = airtable.get_user(str(update.effective_user.id))

    # Send status message with watchlist and preferences
    try:
        watchlist = json.loads(user_data['fields'].get('watchlist', '[]'))
        alert_prefs = json.loads(user_data['fields'].get('alert_preferences', '{}'))
        preferences = json.loads(user_data['fields'].get('preferences', '{}'))
        
        status_msg = "📊 Current Status:\n\n"
        
        # Add status
        status_msg += f"Status: {user_data['fields'].get('status', 'free')}\n\n"
        
        # Add watchlist
        status_msg += "📋 Watchlist:\n"
        if watchlist:
            for swarm in watchlist:
                swarm_name, token = swarm.split('_')
                status_msg += f"• {swarm_name.upper()} ({token.upper()})\n"
        else:
            status_msg += "• No swarms in watchlist\n"
        
        # Add alert preferences
        status_msg += "\n⚡ Alert Preferences:\n"
        status_msg += f"• Price changes: {alert_prefs.get('price_change', 5)}%\n"
        status_msg += f"• New shares: {'Yes' if alert_prefs.get('new_shares', True) else 'No'}\n"
        status_msg += f"• Announcements: {'Yes' if alert_prefs.get('announcements', True) else 'No'}\n"
        
        # Add user preferences if set
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
        logging.error(f"Error sending status message: {e}")

def main():
    # Initialize bot
    app = ApplicationBuilder().token(os.getenv('TELEGRAM_BOT_TOKEN')).build()
    
    # Single handler for all messages
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    # Keep basic command handlers
    app.add_handler(CommandHandler('start', start_command))
    app.add_handler(CommandHandler('help', help_command))

    # Create monitor
    monitor = SwarmMonitor()
    
    # Start both the bot and monitor
    app.run_polling(poll_interval=1.0, timeout=20)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        logging.info("Bot stopped by user")
