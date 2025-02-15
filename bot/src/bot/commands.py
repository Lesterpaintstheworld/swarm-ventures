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
        "Track market opportunities and manage your trading positions.\n\n"
        "Premium Features:\n"
        "• Unlimited swarm tracking\n"
        "• Real-time price alerts\n"
        "• Revenue notifications\n"
        "• Priority support\n\n"
        "One-time payment: 3 SOL\n\n"
        "Available commands:\n"
        "/start - Show this welcome message\n"
        "/help - Show available commands\n"
        "/subscribe - Get access\n"
        "/watchlist - View your watchlist\n"
        "/add <swarm> <token> - Track a new swarm\n"
        "/remove <swarm> <token> - Stop tracking a swarm\n"
    )
    
    await update.message.reply_text(welcome_message)

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle the /help command"""
    help_message = (
        "📚 Available Commands:\n\n"
        "/start - Initialize the bot\n"
        "/help - Show this help message\n"
        "/subscribe - Get access (3 SOL)\n"
        "/watchlist - View your tracked swarms\n"
        "/add <swarm> <token> - Track a new swarm\n"
        "/remove <swarm> <token> - Stop tracking a swarm\n\n"
        "Premium Features:\n"
        "• Unlimited swarm tracking\n"
        "• Real-time price alerts\n"
        "• Revenue notifications\n"
        "• Priority support\n\n"
        "One-time payment: 3 SOL"
    )
    await update.message.reply_text(help_message)

async def subscribe_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle subscription requests"""
    user_id = str(update.message.from_user.id)
    username = update.message.from_user.username
    airtable = AirtableClient()
    
    # Check if already premium
    user = airtable.get_user(user_id)
    if user and user['fields'].get('status') == 'premium':
        await update.message.reply_text(
            "✨ You already have premium access!\n\n"
            "Use /watchlist to manage your tracked swarms."
        )
        return
    
    # Generate payment URL with user's ID
    payment_url = f"https://swarmventures.universalbasiccompute.ai/premium?ref={user_id}"
    
    subscription_message = (
        "🌟 SwarmVentures Premium Access\n\n"
        "Features:\n"
        "• Unlimited swarm tracking\n"
        "• Real-time price alerts\n"
        "• Revenue notifications\n"
        "• Priority support\n\n"
        "One-time Payment: 3 SOL\n\n"
        "To get access:\n"
        "1. Click the payment link below\n"
        "2. Connect your Solana wallet\n"
        "3. Complete the payment\n\n"
        f"🔗 Get Premium: {payment_url}\n\n"
        "Your account will be upgraded automatically after payment confirmation."
    )
    await update.message.reply_text(subscription_message)


async def watchlist_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle the /watchlist command"""
    user_id = str(update.message.from_user.id)
    airtable = AirtableClient()
    
    user = airtable.get_user(user_id)
    if not user:
        await update.message.reply_text(
            "Please use /start to initialize your account first."
        )
        return
        
    if user['fields'].get('status') != 'premium':
        await update.message.reply_text(
            "⭐️ Premium Access Required\n\n"
            "Track unlimited swarms with premium access:\n"
            "• Real-time price alerts\n"
            "• Revenue notifications\n"
            "• Priority support\n\n"
            "One-time payment: 3 SOL\n"
            "Use /subscribe to get started!"
        )
        return
    
    try:
        watchlist = json.loads(user['fields'].get('watchlist', '[]'))
        
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
        
        await update.message.reply_text(message)
        
    except Exception as e:
        logger.error(f"Error in watchlist command: {e}")
        await update.message.reply_text("Error retrieving watchlist. Please try again.")
