import { NextResponse } from 'next/server';

let Airtable: any;
try {
  Airtable = require('airtable');
} catch (error) {
  console.error('Failed to load Airtable:', error);
}

// Initialize Airtable only if the module is available
const getAirtableBase = () => {
  if (!Airtable) {
    throw new Error('Airtable module not available');
  }
  return new Airtable({ apiKey: process.env.AIRTABLE_API_KEY || '' }).base(process.env.AIRTABLE_BASE_ID || '');
};

export async function GET() {
  try {
    // Fetch all records from the INVESTMENTS table
    const base = getAirtableBase();
    const records = await base('INVESTMENTS').select({
      sort: [{ field: 'createdAt', direction: 'desc' }]
    }).all();
    
    // Transform the records to a simpler format
    const investments = records.map((record: any) => ({
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
      { 
        error: 'Failed to fetch investments', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
