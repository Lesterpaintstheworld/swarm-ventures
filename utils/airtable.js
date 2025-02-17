class AirtableClient {
  constructor() {
    this.apiKey = process.env.AIRTABLE_API_KEY;
    this.baseId = process.env.AIRTABLE_BASE_ID;
    this.tableName = process.env.AIRTABLE_TABLE_NAME;
  }

  async update_user_status(telegram_id, status) {
    try {
      const response = await fetch(`https://api.airtable.com/v0/${this.baseId}/${this.tableName}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      const user = data.records.find(record => record.fields.telegram_id === telegram_id);

      if (user) {
        await fetch(`https://api.airtable.com/v0/${this.baseId}/${this.tableName}/${user.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fields: {
              status: status,
              subscription_updated: new Date().toISOString()
            }
          })
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Airtable update error:', error);
      return false;
    }
  }

  async update_payment_details(telegram_id, details) {
    try {
      const response = await fetch(`https://api.airtable.com/v0/${this.baseId}/${this.tableName}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      const user = data.records.find(record => record.fields.telegram_id === telegram_id);

      if (user) {
        await fetch(`https://api.airtable.com/v0/${this.baseId}/${this.tableName}/${user.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fields: {
              payment_date: details.payment_date,
              payment_amount: details.amount_paid,
              transaction_id: details.transaction_signature,
              payment_status: details.payment_status
            }
          })
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Airtable payment update error:', error);
      return false;
    }
  }

  async createListing(listingData) {
    try {
        // Get token label safely with fallback
        const tokenLabel = listingData.token ? listingData.token.label : 'USDC';

        const response = await fetch(`https://api.airtable.com/v0/${this.baseId}/Listings`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                records: [{
                    fields: {
                        id: listingData.listing_id || `L${Math.floor(100000 + Math.random() * 900000)}`,
                        swarm_id: listingData.swarm_id,
                        number_of_shares: listingData.number_of_shares,
                        price_per_share: listingData.price_per_share,
                        total_price: listingData.total_price,
                        seller_wallet: listingData.seller,
                        listing_date: new Date().toISOString(),
                        status: 'active',
                        token_type: tokenLabel
                    }
                }]
            })
        });

        const data = await response.json();
        
        if (!data.records || data.records.length === 0) {
            throw new Error('Failed to create listing record');
        }

        console.log('Created listing:', data.records[0]);
        return data.records[0];
    } catch (error) {
        console.error('Airtable listing creation error:', error, listingData);
        throw error;
    }
  }
}

export { AirtableClient };
