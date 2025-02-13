import logging
import os
import asyncio
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, CallbackQueryHandler
from src.services.monitor import SwarmMonitor

from src.bot.commands import (
    start_command,
    help_command,
    watchlist_command,
    add_to_watchlist,
    remove_from_watchlist,
    browse_swarms,
    button_callback
)

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

def main():
    # Initialize bot
    app = ApplicationBuilder().token(os.getenv('TELEGRAM_BOT_TOKEN')).build()
    
    # Add command handlers
    app.add_handler(CommandHandler('start', start_command))
    app.add_handler(CommandHandler('help', help_command))
    app.add_handler(CommandHandler('watchlist', watchlist_command))
    app.add_handler(CommandHandler('add', add_to_watchlist))
    app.add_handler(CommandHandler('remove', remove_from_watchlist))
    app.add_handler(CommandHandler('browse', browse_swarms))
    app.add_handler(CallbackQueryHandler(button_callback))

    # Create monitor
    monitor = SwarmMonitor()
    
    # Start both the bot and monitor
    app.run_polling(poll_interval=1.0, timeout=20)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        logging.info("Bot stopped by user")
