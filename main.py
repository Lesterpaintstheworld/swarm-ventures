import logging
import os
from dotenv import load_dotenv
from telegram.ext import ApplicationBuilder, CommandHandler

from src.bot.commands import start_command

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
    
    # Start the bot
    app.run_polling()

if __name__ == '__main__':
    main()
