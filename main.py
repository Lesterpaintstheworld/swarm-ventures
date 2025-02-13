import logging
import os
import asyncio
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, CallbackQueryHandler, MessageHandler, filters
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
    # Initialize clients
    claude = ClaudeClient()
    airtable = AirtableClient()
    
    # Get user data from Airtable
    user_data = airtable.get_user(str(update.effective_user.id))
    
    # Get Claude's response
    response = await claude.get_response(
        user_message=update.message.text,
        user_data=user_data
    )
    
    # Execute Airtable operation if present
    if response.get('airtable_op'):
        op = response['airtable_op']
        if op['operation'] == 'add_to_watchlist':
            result = airtable.add_to_watchlist(
                telegram_id=str(update.effective_user.id),
                swarm_id=op['swarm_id']
            )
    
    # Send response to user
    await update.message.reply_text(response['user_response'])

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
