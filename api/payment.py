from fastapi import FastAPI, Request, Response, HTTPException
from src.utils.airtable import AirtableClient
import os
from datetime import datetime
import logging
import json
from solana.rpc.api import Client

# Initialize Solana client
solana = Client(os.getenv('SOLANA_RPC_URL', 'https://api.mainnet-beta.solana.com'))

# Initialize FastAPI app
app = FastAPI()

@app.post("/api/payment/verify")
async def verify_payment(request: Request):
    """Verify Solana payment and upgrade user"""
    try:
        # Get payment data from request
        data = await request.json()
        required_fields = ['signature', 'user_id', 'amount']
        
        # Validate request data
        if not all(field in data for field in required_fields):
            raise HTTPException(
                status_code=400,
                detail="Missing required fields"
            )
            
        # Verify payment amount (3 SOL)
        REQUIRED_AMOUNT = 3 * 10**9  # 3 SOL in lamports
        
        # Get transaction details
        tx_response = solana.get_transaction(data['signature'])
        if not tx_response['result']:
            raise HTTPException(
                status_code=400,
                detail="Invalid transaction signature"
            )
            
        tx = tx_response['result']
        
        # Verify transaction details
        if not verify_transaction(tx, REQUIRED_AMOUNT):
            raise HTTPException(
                status_code=400,
                detail="Invalid transaction amount or recipient"
            )
            
        # Update user status in Airtable
        airtable = AirtableClient()
        user = airtable.get_user(data['user_id'])
        
        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )
            
        # Update user to premium status
        airtable.update_user_status(data['user_id'], "premium")
        
        # Store payment details
        payment_details = {
            'payment_date': datetime.now().isoformat(),
            'amount_paid': '3 SOL',
            'transaction_signature': data['signature'],
            'payment_status': 'completed'
        }
        airtable.update_payment_details(data['user_id'], payment_details)
        
        # Send confirmation message via bot
        try:
            from telegram import Bot
            bot = Bot(token=os.getenv('TELEGRAM_BOT_TOKEN'))
            await bot.send_message(
                chat_id=data['user_id'],
                text=(
                    "🎉 Premium Access Activated!\n\n"
                    "Thank you for your payment. Your account has been upgraded to lifetime premium access.\n\n"
                    "You now have:\n"
                    "✓ Unlimited swarm tracking\n"
                    "✓ Real-time price alerts\n"
                    "✓ Revenue notifications\n"
                    "✓ Priority support\n\n"
                    "Use /watchlist to start tracking swarms!"
                )
            )
        except Exception as e:
            logging.error(f"Failed to send confirmation message: {e}")
        
        return {
            "status": "success",
            "message": "Payment verified and user upgraded"
        }
        
    except Exception as e:
        logging.error(f"Payment verification error: {e}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

def verify_transaction(tx: dict, required_amount: int) -> bool:
    """Verify transaction details"""
    try:
        # Get your payment wallet address from env
        payment_wallet = os.getenv('PAYMENT_WALLET')
        
        # Check if transaction is confirmed
        if tx['meta']['err'] is not None:
            return False
            
        # Verify recipient
        post_balances = tx['meta']['postBalances']
        pre_balances = tx['meta']['preBalances']
        
        # Find the balance change for the payment wallet
        for idx, account in enumerate(tx['transaction']['message']['accountKeys']):
            if account == payment_wallet:
                balance_change = post_balances[idx] - pre_balances[idx]
                if balance_change >= required_amount:
                    return True
                    
        return False
        
    except Exception as e:
        logging.error(f"Transaction verification error: {e}")
        return False
