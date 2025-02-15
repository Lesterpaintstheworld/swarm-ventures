import logging
import os
from dotenv import load_dotenv
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters

from src.bot.commands import (
    start_command, help_command, watchlist_command,
    subscribe_command, unsubscribe_command
)

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

logger = logging.getLogger(__name__)

def main():
    try:
        # Initialize bot with token from environment
        token = os.getenv('TELEGRAM_BOT_TOKEN')
        if not token:
            raise ValueError("TELEGRAM_BOT_TOKEN not found in environment variables")
            
        app = ApplicationBuilder().token(token).build()
        
        # Add command handlers
        app.add_handler(CommandHandler('start', start_command))
        app.add_handler(CommandHandler('help', help_command))
        app.add_handler(CommandHandler('watchlist', watchlist_command))
        app.add_handler(CommandHandler('subscribe', subscribe_command))
        app.add_handler(CommandHandler('unsubscribe', unsubscribe_command))
        
        # Add error handler
        app.add_error_handler(error_handler)
        
        # Add general message handler for non-command messages
        app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
        
        logger.info("Bot started successfully")
        
        # Start the bot
        app.run_polling()
        
    except Exception as e:
        logger.error(f"Error starting bot: {e}")
        raise

async def error_handler(update, context):
    """Handle errors in the telegram bot"""
    logger.error(f"Update {update} caused error {context.error}")
    
async def handle_message(update, context):
    """Handle non-command messages"""
    try:
        # Get user message
        message = update.message.text
        user_id = update.effective_user.id
        
        logger.info(f"Received message from user {user_id}: {message}")
        
        # Here you can add your message handling logic
        # For example, forwarding to Claude or other processing
        
        await update.message.reply_text(
            "I received your message. Please use commands like /help to interact with me."
        )
        
    except Exception as e:
        logger.error(f"Error handling message: {e}")
        await update.message.reply_text(
            "Sorry, I encountered an error processing your message. Please try again."
        )

if __name__ == '__main__':
    main()
