import { NextResponse } from 'next/server';
import Airtable from 'airtable';
import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';
import path from 'path';

// Initialize Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY || '' }).base(process.env.AIRTABLE_BASE_ID || '');

// Initialize Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN || '', { polling: false });
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
    const record = await base('INVESTMENTS').create({
      wallet,
      token,
      amount,
      signature,
      createdAt
    });

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

    return NextResponse.json({ success: true, recordId: record.id });
  } catch (error) {
    console.error('Error recording investment:', error);
    return NextResponse.json(
      { error: 'Failed to record investment' },
      { status: 500 }
    );
  }
}
