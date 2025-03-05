import { NextResponse } from 'next/server';
import Airtable from 'airtable';

// Initialize Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

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

    return NextResponse.json({ success: true, recordId: record.id });
  } catch (error) {
    console.error('Error recording investment:', error);
    return NextResponse.json(
      { error: 'Failed to record investment' },
      { status: 500 }
    );
  }
}
