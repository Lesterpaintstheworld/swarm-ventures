import os
import time
import asyncio
from fastapi import FastAPI, Request, Response, HTTPException
from datetime import datetime, timedelta
from telegram import Update
from telegram.ext import Application
import json
from dotenv import load_dotenv

# Initialize rate limiting
rate_limit_store = {}

def check_rate_limit(user_id: str, limit: int = 30):
    """Check if user has exceeded rate limit"""
    now = datetime.now()
    if user_id in rate_limit_store:
        # Remove requests older than 1 minute
        rate_limit_store[user_id] = [
            t for t in rate_limit_store[user_id] 
            if now - t < timedelta(minutes=1)
        ]
        if len(rate_limit_store[user_id]) >= limit:
            raise HTTPException(
                status_code=429, 
                detail="Too many requests. Please wait a minute."
            )
    rate_limit_store.setdefault(user_id, []).append(now)

# Initialize FastAPI app
app = FastAPI()

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    print(f"Request processed in {process_time:.2f} seconds")
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Initialize bot application
application = Application.builder().token(os.getenv('TELEGRAM_BOT_TOKEN')).build()

@app.get("/")
async def root():
    """Root endpoint for health checks"""
    return {"status": "ok"}

async def start_command(update: Update, context):
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
    )
    await update.message.reply_text(welcome_message)

async def help_command(update: Update, context):
    """Handle the /help command"""
    help_message = (
        "📚 Available Commands:\n\n"
        "/start - Initialize the bot\n"
        "/help - Show this help message\n"
        "/subscribe - Get access (3 SOL)\n"
        "/watchlist - View your tracked swarms\n"
    )
    await update.message.reply_text(help_message)

async def subscribe_command(update: Update, context):
    """Handle subscription requests"""
    user_id = str(update.message.from_user.id)
    username = update.message.from_user.username
    
    # Initialize Airtable client
    from .airtable import AirtableClient
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
    payment_url = f"https://swarms.universalbasiccompute.ai/premium?ref={user_id}"
    
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
        f"🔗 Get Premium: https://swarm-ventures.vercel.app/premium?ref={user_id}\n\n"
        "Your account will be upgraded automatically after payment confirmation."
    )
    await update.message.reply_text(subscription_message)

async def watchlist_command(update: Update, context):
    """Handle the /watchlist command"""
    from .airtable import AirtableClient
    
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
        print(f"Error in watchlist command: {e}")
        await update.message.reply_text("Error retrieving watchlist. Please try again.")

@app.post("/api/telegram")
async def telegram_webhook(request: Request):
    """Handle incoming webhook updates from Telegram"""
    try:
        # Get the update data
        data = await request.json()
        print(f"Received webhook data: {json.dumps(data, indent=2)}")
        
        # Create Update object
        update = Update.de_json(data, application.bot)
        
        # Simple verification: if chat_id is negative, it's a group
        if update.message and update.message.chat.id < 0:
            print(f"Ignoring group message from chat {update.message.chat.id}")
            return Response(status_code=200)
        
        if update.message and update.message.text:
            if update.message.text.startswith('/'):
                command = update.message.text.split()[0].lower()
                if command == '/start':
                    await start_command(update, None)
                    return Response(status_code=200)
                elif command == '/help':
                    await help_command(update, None)
                    return Response(status_code=200)
                elif command == '/watchlist':
                    await watchlist_command(update, None)
                    return Response(status_code=200)
                elif command == '/subscribe':
                    await subscribe_command(update, None)
                    return Response(status_code=200)
            
            # If not a command, process with Claude
            from src.services.claude_client import ClaudeClient
            from .airtable import AirtableClient
            
            # Initialize clients
            claude = ClaudeClient()
            airtable = AirtableClient()
            
            # Get user data
            user_data = airtable.get_user(str(update.message.from_user.id))
            
            # Get Claude's response
            response = await claude.get_response(
                update.message.text,
                user_data
            )
            
            # Send Claude's response to user
            await update.message.reply_text(response["user_response"])
            
            # Process any Airtable operations if present
            if response.get("airtable_op"):
                op = response["airtable_op"]
                if op["operation"] == "add_to_watchlist":
                    # Add telegram_id if not in params
                    op["params"]["telegram_id"] = str(update.message.from_user.id)
                    # Execute operation
                    # ... (implement operation handling)
        
        return Response(status_code=200)
            
    except Exception as e:
        print(f"Error processing update: {e}")
        return Response(status_code=500)

@app.get("/api/telegram")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}
