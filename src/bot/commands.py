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
        "🚀 Welcome to the UBC Swarm Alert System!\n\n"
        "I'll help you track your AI swarm investments and notify you of important updates.\n\n"
        "You'll receive alerts for:\n"
        "📈 Share price changes\n"
        "💰 Weekly revenue distributions\n"
        "📢 Important swarm announcements\n"
        "🔄 New share availability\n\n"
        "Available commands:\n"
        "/start - Show this welcome message\n"
        "/help - Show available commands\n"
        "/watchlist - View your tracked swarms\n"
        "/add <swarm_id> - Track a new swarm\n"
        "/remove <swarm_id> - Stop tracking a swarm\n\n"
        "🌐 View your swarms: https://swarms.universalbasiccompute.ai/\n\n"
        "Need help? Contact @SwarmVenturesSupport"
    )
    
    await update.message.reply_text(welcome_message)

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle the /help command"""
    help_message = (
        "📚 Available Commands:\n\n"
        "/start - Show welcome message\n"
        "/help - Show this help message\n"
        "/watchlist - View your swarm watchlist\n"
        "/add <swarm_id> - Add swarm to watchlist\n"
        "  Example: /add KINESIS-1\n"
        "/remove <swarm_id> - Remove swarm from watchlist\n"
        "  Example: /remove KINESIS-1\n\n"
        "Swarm IDs are in the format: NAME-NUMBER\n"
        "You'll receive alerts when:\n"
        "• New swarm shares become available\n"
        "• Price changes exceed thresholds\n"
        "• Important swarm announcements\n\n"
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

    message = "🔍 Your Swarm Watchlist:\n\n"
    for swarm in watchlist:
        message += f"• {swarm}\n"
        # TODO: Add current share price and performance metrics
    
    message += "\nYou'll receive alerts when important changes occur."
    await update.message.reply_text(message)
