from telegram import Update
from telegram.ext import ContextTypes
from src.utils.airtable import AirtableClient

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle the /start command"""
    # Store user in Airtable
    airtable = AirtableClient()
    user = update.effective_user
    if not airtable.get_user(str(user.id)):
        airtable.create_user(str(user.id), user.username or "")

    welcome_message = (
        "🚀 Welcome to SwarmVentures Trading Bot!\n\n"
        "I'll help you track market opportunities and manage your trading positions.\n\n"
        "Available commands:\n"
        "/start - Show this welcome message\n"
        "/help - Show available commands\n"
        "/watchlist - View your watchlist\n"
        "/add <symbol> - Add token to watchlist\n"
        "/remove <symbol> - Remove token from watchlist\n"
    )
    
    await update.message.reply_text(welcome_message)

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle the /help command"""
    help_message = (
        "📚 Available Commands:\n\n"
        "/start - Show welcome message\n"
        "/help - Show this help message\n"
        "/watchlist - View your watchlist\n"
        "/add <symbol> - Add token to watchlist\n"
        "  Example: /add SOL\n"
        "/remove <symbol> - Remove token from watchlist\n"
        "  Example: /remove SOL\n\n"
        "Need more help? Contact @SwarmVenturesSupport"
    )
    await update.message.reply_text(help_message)

async def watchlist_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle the /watchlist command"""
    airtable = AirtableClient()
    user = airtable.get_user(str(update.effective_user.id))
    
    if not user:
        await update.message.reply_text("Please use /start to initialize your account first.")
        return

    watchlist = user.get('fields', {}).get('watchlist', [])
    if not watchlist:
        await update.message.reply_text("Your watchlist is empty. Add tokens using /add <symbol>")
        return

    message = "🔍 Your Watchlist:\n\n"
    for token in watchlist:
        message += f"• {token}\n"
    
    await update.message.reply_text(message)
