import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Try to load dependencies
let Airtable: any;
let TelegramBot: any;

try {
  Airtable = require('airtable');
} catch (error) {
  console.error('Failed to load Airtable:', error);
}

try {
  TelegramBot = require('node-telegram-bot-api');
} catch (error) {
  console.error('Failed to load TelegramBot:', error);
}

// Initialize Airtable only if the module is available
const getAirtableBase = () => {
  if (!Airtable) {
    throw new Error('Airtable module not available');
  }
  return new Airtable({ apiKey: process.env.AIRTABLE_API_KEY || '' }).base(process.env.AIRTABLE_BASE_ID || '');
};

// Initialize Telegram Bot only if the module is available
const getTelegramBot = () => {
  if (!TelegramBot) {
    throw new Error('TelegramBot module not available');
  }
  return new TelegramBot(process.env.TELEGRAM_BOT_TOKEN || '', { polling: false });
};

const MAIN_TELEGRAM_CHAT_ID = -1001699255893;

export async function POST(request: Request) {
  try {
    const { wallet, token, amount, signature, createdAt } = await request.json();

    // Validate the required fields
    if (!wallet || !token || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create a record in the INVESTMENTS table
    let record;
    try {
      const base = getAirtableBase();
      record = await base('INVESTMENTS').create({
        wallet,
        token,
        amount,
        signature,
        createdAt
      });
    } catch (airtableError) {
      console.error('Error creating Airtable record:', airtableError);
      // Continue execution to try sending Telegram notification
    }

    // Format wallet address for display
    const formatWallet = (address: string): string => {
      if (!address) return '';
      return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };

    // Send Telegram notification
    try {
      // Format the message
      const message = `🚀 *New Investment Received!*\n\n` +
        `💰 *Amount:* ${Number(amount).toLocaleString()} $${token}\n` +
        `👛 *Wallet:* \`${formatWallet(wallet)}\`\n` +
        `🔗 *Transaction:* [View on Solscan](https://solscan.io/tx/${signature})\n\n` +
        `⏰ *Date:* ${new Date().toLocaleString()}\n\n` +
        `SwarmVentures - Professional Portfolio Management`;

      // Get the image path
      const imagePath = path.join(process.cwd(), 'public', 'swarmventures.jpg');
      
      // Get Telegram bot instance
      const bot = getTelegramBot();
      
      // Send the message with photo
      if (fs.existsSync(imagePath)) {
        await bot.sendPhoto(MAIN_TELEGRAM_CHAT_ID, imagePath, {
          caption: message,
          parse_mode: 'Markdown'
        });
      } else {
        // Fallback to text message if image doesn't exist
        await bot.sendMessage(MAIN_TELEGRAM_CHAT_ID, message, {
          parse_mode: 'Markdown'
        });
      }
      
      console.log('Telegram notification sent successfully');
    } catch (telegramError) {
      console.error('Error sending Telegram notification:', telegramError);
      // Don't fail the request if Telegram notification fails
    }

    return NextResponse.json({ 
      success: true, 
      recordId: record?.id || 'record-creation-skipped'
    });
  } catch (error) {
    console.error('Error recording investment:', error);
    return NextResponse.json(
      { 
        error: 'Failed to record investment',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
