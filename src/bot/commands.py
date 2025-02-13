import json
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes, CallbackQueryHandler
from src.utils.airtable import AirtableClient

# Available swarms for the browse command
AVAILABLE_SWARMS = [
    "kinkong", "digitalkin", "duoai", "propertykin", "swarmventures",
    "syntheticsouls", "xforge", "kinos", "playwise", "robinhoodagent",
    "aialley", "logicatlas", "wealthhive", "commercenest", "profitbeeai",
    "deskmate", "publishkin", "studiokin", "stumped", "therapykin",
    "carehive", "travelaidai", "talentkin", "careerkin", "grantkin"
]

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
        "/browse - Browse available swarms\n"
        "/watchlist - View your swarm watchlist\n"
        "/add <swarm_id> - Add swarm to watchlist\n"
        "  Example: /add KINKONG\n"
        "/remove <swarm_id> - Remove swarm from watchlist\n"
        "  Example: /remove KINKONG\n\n"
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

    try:
        watchlist = json.loads(user.get('fields', {}).get('watchlist', '[]'))
        if not watchlist:
            await update.message.reply_text(
                "Your watchlist is empty. Use /browse to see available swarms or "
                "add manually using /add <swarm_id>"
            )
            return

        message = "🔍 Your Swarm Watchlist:\n\n"
        for swarm in watchlist:
            message += f"• {swarm}\n"
        
        message += "\nYou'll receive alerts when important changes occur."
        await update.message.reply_text(message)
    except json.JSONDecodeError:
        await update.message.reply_text("Error reading watchlist. Please try again.")

async def add_to_watchlist(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle the /add command"""
    if not context.args:
        await update.message.reply_text("Please provide a swarm ID. Example: /add KINESIS-1")
        return

    swarm_id = context.args[0].upper()
    airtable = AirtableClient()
    user = airtable.get_user(str(update.effective_user.id))
    
    if not user:
        await update.message.reply_text("Please use /start to initialize your account first.")
        return
        
    result = airtable.add_to_watchlist(str(update.effective_user.id), swarm_id)
    if result:
        await update.message.reply_text(f"✅ Added {swarm_id} to your watchlist!")
    else:
        await update.message.reply_text("❌ Failed to add to watchlist. Please try again.")

async def browse_swarms(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Display available swarms as buttons"""
    keyboard = []
    # Create rows of 3 buttons each
    for i in range(0, len(AVAILABLE_SWARMS), 3):
        row = []
        for swarm in AVAILABLE_SWARMS[i:i+3]:
            row.append(InlineKeyboardButton(swarm, callback_data=f"add_{swarm}"))
        keyboard.append(row)

    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(
        "🔍 Select a swarm to add to your watchlist:",
        reply_markup=reply_markup
    )

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle button clicks"""
    query = update.callback_query
    await query.answer()  # Acknowledge the button click
    
    # Extract swarm name from callback_data
    action, swarm = query.data.split('_')
    if action == "add":
        airtable = AirtableClient()
        result = airtable.add_to_watchlist(str(update.effective_user.id), swarm)
        
        if result:
            await query.message.edit_text(
                f"✅ Added {swarm} to your watchlist!\n\n"
                "Use /browse to add more swarms or /watchlist to see your tracked swarms."
            )
        else:
            await query.message.edit_text(
                "❌ Failed to add to watchlist. Please try again or use /start first."
            )

async def remove_from_watchlist(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle the /remove command"""
    if not context.args:
        await update.message.reply_text("Please provide a swarm ID. Example: /remove KINESIS-1")
        return

    swarm_id = context.args[0].upper()
    airtable = AirtableClient()
    user = airtable.get_user(str(update.effective_user.id))
    
    if not user:
        await update.message.reply_text("Please use /start to initialize your account first.")
        return
        
    result = airtable.remove_from_watchlist(str(update.effective_user.id), swarm_id)
    if result:
        await update.message.reply_text(f"✅ Removed {swarm_id} from your watchlist!")
    else:
        await update.message.reply_text("❌ Failed to remove from watchlist. Please try again.")
