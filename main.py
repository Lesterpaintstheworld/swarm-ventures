import logging
import os
from dotenv import load_dotenv
from telegram.ext import ApplicationBuilder, CommandHandler, CallbackQueryHandler

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
    
    # Start the bot
    app.run_polling()

if __name__ == '__main__':
    main()
