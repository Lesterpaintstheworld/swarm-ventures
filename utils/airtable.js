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
}

export { AirtableClient };
