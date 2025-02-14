from fastapi import FastAPI, Request, Response
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, CallbackQueryHandler
import json
import os
from dotenv import load_dotenv
from src.bot.commands import start_command, help_command
from src.services.claude_client import ClaudeClient
from src.utils.airtable import AirtableClient
from main import handle_message

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Initialize bot application
application = Application.builder().token(os.getenv('TELEGRAM_BOT_TOKEN')).build()

# Add handlers
application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
application.add_handler(CommandHandler('start', start_command))
application.add_handler(CommandHandler('help', help_command))

@app.post("/api/telegram")
async def telegram_webhook(request: Request):
    """Handle incoming webhook updates from Telegram"""
    
    # Get the update data
    data = await request.json()
    update = Update.de_json(data, application.bot)
    
    # Process the update
    await application.process_update(update)
    
    return Response(status_code=200)

# Startup and shutdown events
@app.on_event("startup")
async def startup():
    """Set webhook on startup"""
    WEBHOOK_URL = os.getenv('VERCEL_URL', 'https://swarm-ventures.vercel.app') + '/api/telegram'
    await application.bot.set_webhook(WEBHOOK_URL)

@app.on_event("shutdown")
async def shutdown():
    """Remove webhook on shutdown"""
    await application.bot.delete_webhook()
