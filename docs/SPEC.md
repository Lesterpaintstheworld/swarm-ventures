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
