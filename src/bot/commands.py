from telegram import Update
from telegram.ext import ContextTypes

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle the /start command"""
    welcome_message = (
        "🚀 Welcome to SwarmVentures Trading Bot!\n\n"
        "I'll help you track market opportunities and manage your trading positions.\n\n"
        "Available commands:\n"
        "/start - Show this welcome message\n"
        "/help - Show available commands\n"
        "/watchlist - View your watchlist\n"
    )
    
    await update.message.reply_text(welcome_message)
