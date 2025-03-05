import { NextResponse } from 'next/server';
import Airtable from 'airtable';

// Initialize Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

export async function GET() {
  try {
    // Fetch all records from the INVESTMENTS table
    const records = await base('INVESTMENTS').select({
      sort: [{ field: 'createdAt', direction: 'desc' }]
    }).all();
    
    // Transform the records to a simpler format
    const investments = records.map(record => ({
      id: record.id,
      wallet: record.get('wallet'),
      token: record.get('token'),
      amount: record.get('amount'),
      signature: record.get('signature'),
      createdAt: record.get('createdAt')
    }));

    return NextResponse.json({ investments });
  } catch (error) {
    console.error('Error fetching investments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investments' },
      { status: 500 }
    );
  }
}
