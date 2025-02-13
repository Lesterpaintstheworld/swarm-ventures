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

async def run_bot():
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
    
    # Start the bot
    await app.initialize()
    await app.start()
    await app.run_polling(allowed_updates=Update.ALL_TYPES)

async def run_monitor():
    monitor = SwarmMonitor()
    await monitor.monitor_loop()

async def main():
    try:
        # Run bot and monitor concurrently
        await asyncio.gather(
            run_bot(),
            run_monitor()
        )
    except KeyboardInterrupt:
        # Handle graceful shutdown
        logging.info("Shutting down...")

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logging.info("Bot stopped by user")
