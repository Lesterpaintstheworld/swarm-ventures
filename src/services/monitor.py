import asyncio
import logging
import json
from datetime import datetime
from src.utils.airtable import AirtableClient

logger = logging.getLogger(__name__)

class SwarmMonitor:
    def __init__(self):
        self.airtable = AirtableClient()
        self.previous_metrics = {}  # Cache for comparing changes
        
    async def check_swarm_metrics(self, swarm_id: str):
        """Get current metrics for a swarm"""
        # TODO: Implement API call to get swarm metrics
        return {
            'price': 100,
            'weekly_revenue': 1000,
            'shares_available': 100,
            # Add new launchpad metrics
            'bonding_curve': {
                'current_cycle': 3,  # Current 5000-share cycle
                'shares_in_cycle': 2500,  # Shares sold in current cycle
                'current_price': 2.4,  # Current price from bonding curve
                'next_price': 3.24  # Price after cycle completion
            },
            'revenue_distribution': {
                'autonomy_level': 50,  # Percentage
                'last_distribution': '2024-03-14',
                'burn_amount': 500000,  # UBC burned
                'shareholder_amount': 250000  # UBC to shareholders
            },
            'trading_metrics': {
                'volume_24h': 50000,
                'holders': 150,
                'market_cap': 1000000
            }
        }
    
    async def generate_alerts(self, user_id: str, swarm_id: str, old_metrics: dict, new_metrics: dict):
        """Generate alerts based on metric changes"""
        alerts = []
        
        # Existing alerts
        if old_metrics.get('price'):
            price_change = ((new_metrics['price'] - old_metrics['price']) / old_metrics['price']) * 100
            if abs(price_change) >= 5:
                alerts.append(
                    f"💰 {swarm_id.upper()}: Price changed by {price_change:.1f}%\n"
                    f"New price: ${new_metrics['price']:,.2f}"
                )
        
        # New bonding curve alerts
        if new_metrics['bonding_curve']['shares_in_cycle'] >= 4750 and \
           old_metrics.get('bonding_curve', {}).get('shares_in_cycle', 0) < 4750:
            alerts.append(
                f"⚠️ {swarm_id.upper()}: Approaching cycle end!\n"
                f"• Current price: ${new_metrics['bonding_curve']['current_price']}\n"
                f"• Next cycle price: ${new_metrics['bonding_curve']['next_price']}\n"
                f"• Only {5000 - new_metrics['bonding_curve']['shares_in_cycle']} shares left at current price"
            )
        
        # Revenue distribution alerts
        new_dist = new_metrics['revenue_distribution']
        old_dist = old_metrics.get('revenue_distribution', {})
        
        if new_dist['last_distribution'] != old_dist.get('last_distribution'):
            alerts.append(
                f"📢 {swarm_id.upper()}: Weekly distribution completed!\n"
                f"• ${new_dist['burn_amount']:,.0f} UBC burned\n"
                f"• ${new_dist['shareholder_amount']:,.0f} UBC to shareholders\n"
                f"• Current autonomy level: {new_dist['autonomy_level']}%"
            )
        
        # Trading metrics alerts
        new_trade = new_metrics['trading_metrics']
        old_trade = old_metrics.get('trading_metrics', {})
        
        volume_change = ((new_trade['volume_24h'] - old_trade.get('volume_24h', 0)) 
                        / old_trade.get('volume_24h', 1)) * 100
        if abs(volume_change) >= 50:  # 50% volume change
            alerts.append(
                f"📊 {swarm_id.upper()}: Significant volume change!\n"
                f"• 24h volume: ${new_trade['volume_24h']:,.0f}\n"
                f"• Change: {volume_change:+.1f}%"
            )
        
        return alerts

    async def monitor_loop(self):
        """Main monitoring loop"""
        while True:
            try:
                # Get all users
                users = self.airtable.get_all_users()
                
                for user in users:
                    user_id = user['fields']['telegram_id']
                    watchlist = json.loads(user['fields'].get('watchlist', '[]'))
                    
                    for swarm_id in watchlist:
                        # Get new metrics
                        new_metrics = await self.check_swarm_metrics(swarm_id)
                        old_metrics = self.previous_metrics.get(swarm_id, {})
                        
                        # Generate and send alerts
                        alerts = await self.generate_alerts(user_id, swarm_id, old_metrics, new_metrics)
                        if alerts:
                            # TODO: Send alerts via bot
                            logger.info(f"Alerts for {user_id}: {alerts}")
                        
                        # Update previous metrics
                        self.previous_metrics[swarm_id] = new_metrics
                
                # Wait before next check
                await asyncio.sleep(300)  # 5 minutes
                
            except Exception as e:
                logger.error(f"Error in monitor loop: {e}")
                await asyncio.sleep(60)  # Wait 1 minute on error
