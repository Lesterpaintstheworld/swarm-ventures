# Institutional Trading Implementation

## Overview
Implementation of institutional-grade trading capabilities with whale tracking, market opportunity detection, and portfolio management.

## User Stories

### Subscription System

#### As a user, I want to connect my wallet using /connect command so that I can verify ownership
- Bot generates unique message to sign: 'KinKong verification {random_uuid}'
- User signs with Solana wallet via sign.solana.com
- Bot verifies signature using @solana/web3.js
- Bot stores wallet address and Telegram ID in users.json
- Success message shows verified wallet address
- Error message prompts to try again if verification fails

#### As a user, I want to check my subscription status using /status command
- View connected wallet address (first 4 + last 4 chars)
- See current USDC balance from Helius API
- Check subscription status (active if balance >= 1,000 USDC)
- View last profit distribution amount and date
- Show error if wallet not connected

#### As a user, I want to subscribe by sending USDC
- Minimum 1,000 USDC requirement
- Transfer to KinKong wallet (FnWyN4t1aoZWFjEEBxopMaAgk5hjL5P3K65oc2T9FBJY)
- Helius webhook monitors for incoming transfers
- n8n workflow filters transfers >= 1,000 USDC
- Welcome message includes portfolio tracking link
- Store subscription date and amount in database

### Portfolio Management

#### As a user, I want to track my portfolio in real-time
- View current positions with entry prices
- Check profit/loss per position
- Monitor weekly distributions with dates
- Access full trading history with timestamps
- Filter trades by date range
- Export data in CSV format

#### As a user, I want to receive weekly profit distributions
- 75% profit share calculated every Friday
- Automatic USDC distribution via smart contract
- Distribution records stored on-chain
- Performance updates include:
  - Weekly profit amount
  - Distribution amount (75%)
  - New portfolio value
  - Transaction hash

### Trading System

#### As an admin, I want to monitor whale movements
- Track wallets with > $1M in AI tokens
- Analyze smart money flow patterns:
  - Buy/sell volume ratios
  - Token accumulation rates
  - Position sizing patterns
  - Trading frequency
- Monitor DEX liquidity changes:
  - Pool depth changes
  - Liquidity provider actions
  - Price impact analysis
- Track token velocity metrics:
  - Transaction frequency
  - Volume patterns
  - Holder turnover

#### As an admin, I want to detect market opportunities
- Focus on top 5 AI tokens by market cap
- Trade only during uptrends defined by:
  - 20-day moving average positive slope
  - RSI between 40-70
  - Increasing volume trend
- Maximum 3 positions at once with:
  - 2% max position size
  - 5% stop-loss per trade
  - 15% take-profit targets
- Strict stop-loss implementation:
  - Automated execution
  - No manual overrides
  - Immediate order placement

### Technical Implementation

#### As a developer, I want to implement USDC transfer monitoring
- Helius webhook configuration:
  - Endpoint: /webhook/transfers
  - Filter: USDC token only
  - Minimum amount: 1,000 USDC
- n8n workflow steps:
  - Receive webhook data
  - Extract sender address
  - Verify amount >= 1,000
  - Update subscriber database
  - Trigger welcome message
- Automatic subscriber updates:
  - Store subscription timestamp
  - Record transfer amount
  - Update user status
  - Send confirmation

#### As a developer, I want to implement secure data storage
- Store user data in JSON format:
  ```json
  {
    "telegramId": "string",
    "walletAddress": "string",
    "subscriptionDate": "ISO-8601",
    "lastDistribution": {
      "amount": "number",
      "date": "ISO-8601",
      "txHash": "string"
    },
    "status": "active|inactive"
  }
  ```
- Track wallet addresses with verification status
- Monitor subscription dates for reporting
- Record all distributions with transaction hashes

### Technical Components

#### Whale Tracking System
- Real-time transaction monitoring
- Large holder analysis
- Movement pattern detection
- Alert system

#### Market Opportunity Detection
- AI token market analysis
- Trend identification
- Entry/exit point calculation
- Risk assessment

#### Risk Management Protocols
- Position size limits
- Stop-loss automation
- Portfolio diversification rules
- Exposure management

#### Portfolio Optimization Tools
- Performance analytics
- Risk-adjusted returns
- Rebalancing automation
- Distribution calculations

## Phasing Strategy

### Phase 1 - Core Notification System (3 days)
- Telegram bot implementation
- Watchlist management (manual entry via Airtable)
- Price threshold monitoring
- Direct trading page links

Benefits:
- Immediate value delivery to users
- Early feedback collection
- Manual user onboarding via Airtable
- Opportunity to refine offering

### Phase 2 - Full Automation (2 days)
- Self-service subscription system
- Payment processing
- User management automation
- Analytics dashboard

## Implementation Timeline

### Phase 1 (Days 1-3)
#### Day 1: Bot Setup
- Telegram bot implementation
- Basic command structure
- Integration with Airtable

#### Day 2: Monitoring System
- Price monitoring implementation
- Threshold configuration
- Alert system setup

#### Day 3: User Interface
- Trading page link generation
- Alert formatting
- Initial user testing

### Phase 2 (Days 4-5)
#### Day 4: Automation
- Subscription system implementation
- Payment processing setup
- User database migration

#### Day 5: Dashboard & Testing
- Analytics dashboard development
- System integration testing
- Performance optimization
- Security review
