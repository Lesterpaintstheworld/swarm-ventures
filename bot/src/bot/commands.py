from telegram import Update
from telegram.ext import ContextTypes
from src.utils.airtable import AirtableClient
from datetime import datetime
import json
import logging

logger = logging.getLogger(__name__)

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle the /start command"""
    welcome_message = (
        "🚀 Welcome to SwarmVentures Trading Bot!\n\n"
        "I'll help you track market opportunities and manage your trading positions.\n\n"
        "Available commands:\n"
        "/start - Show this welcome message\n"
        "/help - Show available commands\n"
        "/watchlist - View your watchlist\n"
        "/subscribe - Get premium access\n"
        "/unsubscribe - Cancel premium access\n"
    )
    
    await update.message.reply_text(welcome_message)

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle the /help command"""
    help_message = (
        "📚 Available Commands:\n\n"
        "/start - Initialize the bot\n"
        "/help - Show this help message\n"
        "/watchlist - View your tracked swarms\n"
        "/subscribe - Get premium access\n"
        "/unsubscribe - Cancel premium\n\n"
        "Subscription Benefits:\n"
        "• Free: Track 1 swarm\n"
        "• Premium (10,000 $UBC/week):\n"
        "  - Unlimited swarm tracking\n"
        "  - Real-time price alerts\n"
        "  - Revenue notifications"
    )
    await update.message.reply_text(help_message)

async def subscribe_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle subscription requests"""
    user_id = str(update.message.from_user.id)
    username = update.message.from_user.username
    airtable = AirtableClient()
    
    # Create user if doesn't exist
    user = airtable.get_user(user_id)
    if not user:
        user = airtable.create_user(user_id, username)
    
    subscription_message = (
        "📊 SwarmVentures Premium Access\n\n"
        "Benefits:\n"
        "• Unlimited swarm tracking\n"
        "• Real-time price alerts\n"
        "• Revenue notifications\n"
        "• Priority support\n\n"
        "Price: 10,000 $UBC/week\n\n"
        "To subscribe:\n"
        "1. Send 10,000 $UBC to:\n"
        "[Wallet address]\n\n"
        f"2. Include your Telegram ID ({user_id}) in the memo\n\n"
        "Your subscription will be activated within 5 minutes of payment confirmation."
    )
    await update.message.reply_text(subscription_message)

async def unsubscribe_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle unsubscribe requests"""
    user_id = str(update.message.from_user.id)
    airtable = AirtableClient()
    
    user = airtable.get_user(user_id)
    if not user:
        await update.message.reply_text("You don't have an active subscription.")
        return
    
    # Update user status to free
    airtable.update_user_status(user_id, "free")
    
    message = (
        "✅ Subscription Cancelled\n\n"
        "• Your premium access will end at the end of current period\n"
        "• You can still track 1 swarm with the free plan\n"
        "• Use /subscribe to restore premium access anytime\n\n"
        "Thank you for using SwarmVentures!"
    )
    await update.message.reply_text(message)

async def watchlist_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle the /watchlist command"""
    user_id = str(update.message.from_user.id)
    airtable = AirtableClient()
    
    user = airtable.get_user(user_id)
    if not user:
        await update.message.reply_text("Please use /start to initialize your account first.")
        return
    
    try:
        watchlist = json.loads(user['fields'].get('watchlist', '[]'))
        status = user['fields'].get('status', 'free')
        
        message = "📋 Your Watchlist:\n\n"
        
        if not watchlist:
            message += "No swarms in watchlist yet.\n"
        else:
            for swarm in watchlist:
                try:
                    swarm_name, token = swarm.split('_')
                    message += f"• {swarm_name.upper()} ({token.upper()})\n"
                except ValueError:
                    message += f"• {swarm}\n"
        
        message += f"\nStatus: {'🌟 Premium' if status == 'premium' else '🆓 Free'}\n"
        if status == 'free':
            message += "\nUpgrade to premium to track unlimited swarms!\nUse /subscribe to learn more."
        
        await update.message.reply_text(message)
        
    except Exception as e:
        logger.error(f"Error in watchlist command: {e}")
        await update.message.reply_text("Error retrieving watchlist. Please try again.")
