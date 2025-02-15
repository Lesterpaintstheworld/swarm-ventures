# Market Notification Service Technical Specification

## Phase 1: Core Notification System

### Telegram Bot Commands

1. `/start` 
- Welcomes user
- Explains service
- Checks if user is in Airtable allowlist

2. `/watchlist`
- Shows current watched swarms
- Displays current price thresholds

3. `/help`
- Lists available commands
- Provides command usage examples

### n8n Workflows

1. User Authentication Flow:
```
Telegram Trigger → Airtable Query (allowlist) → Response Handler
```

2. Price Monitor Flow (runs every 5 minutes):
```
Schedule → Airtable Query (watchlists) → HTTP Request (price data) → Filter (threshold check) → Telegram Alert
```

3. Status Update Flow (daily):
```
Schedule → Airtable Query (active users) → Generate Report → Telegram Alert
```

### Airtable Structure

1. Users Table:
- TelegramID
- Username
- Status (active/inactive)
- JoinDate

2. Watchlists Table:
- TelegramID
- SwarmID
- MaxPrice
- NotificationEnabled

## Phase 2: Full Automation

### Additional Telegram Commands

1. `/subscribe`
- Initiates subscription process
- Displays pricing information
- Generates payment link

2. `/add <swarm> <price>`
- Adds swarm to watchlist
- Sets price threshold

3. `/remove <swarm>`
- Removes swarm from watchlist

4. `/settings`
- Manages notification preferences
- Updates price thresholds

5. `/status`
- Shows subscription status
- Displays usage statistics

### Additional n8n Workflows

1. Subscription Management Flow:
```
Payment Webhook → Update Airtable → Send Welcome → Enable Monitoring
```

2. Analytics Flow (weekly):
```
Schedule → Collect Metrics → Generate Report → Store Results → Alert Admin
```

3. Auto-renewal Flow:
```
Schedule → Check Expiring → Payment Request → Update Status
```

### Extended Airtable Structure

1. Subscriptions Table:
- TelegramID
- PlanType
- StartDate
- EndDate
- PaymentStatus

2. Analytics Table:
- Date
- ActiveUsers
- AlertsSent
- ResponseRate

## Implementation Priority

Phase 1 (Days 1-3):
1. Basic bot setup with /start, /watchlist, /help
2. Price monitoring workflow
3. Manual user management via Airtable

Phase 2 (Days 4-5):
1. Subscription commands
2. Payment integration
3. Analytics system

## Technical Requirements

1. Infrastructure:
- n8n instance on KinOS
- Telegram Bot API access
- Airtable API integration

2. Data Storage:
- Airtable for user management
- n8n for workflow state
- Temporary cache for price data

3. Monitoring:
- Workflow execution logs
- Alert delivery confirmation
- Error tracking

## Security Considerations

1. User Authentication:
- Telegram user verification
- Airtable access control
- API key management

2. Data Protection:
- Encrypted communication
- Rate limiting
- Access logging

## Testing Strategy

1. Phase 1:
- Command response accuracy
- Price threshold triggers
- Alert delivery timing

2. Phase 2:
- Subscription flow
- Payment processing
- Analytics accuracy