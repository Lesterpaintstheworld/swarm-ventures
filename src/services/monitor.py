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
        try:
            # TODO: Replace with actual API call
            # Example API endpoint: https://api.universalbasiccompute.ai/v1/swarms/{swarm_id}/metrics
            # For now return mock data with more metrics
            return {
                'bonding_curve': {
                    'current_cycle': 3,
                    'shares_in_cycle': 2500,
                    'current_price': 2.4,
                    'next_price': 3.24,
                    'total_supply': 15000,
                    'market_cap': 36000,
                    'volume_24h': 5000,
                    'price_change_24h': 0.15
                },
                'revenue': {
                    'weekly': 420000,
                    'total': 3150000,
                    'growth_rate': 0.25
                }
            }
        except Exception as e:
            logger.error(f"Error fetching metrics for {swarm_id}: {e}")
            return None
    
    async def generate_alerts(self, user_id: str, swarm_id: str, old_metrics: dict, new_metrics: dict):
        """Generate alerts for various swarm events"""
        if not old_metrics or not new_metrics:
            return []

        alerts = []
        bonding_curve = new_metrics['bonding_curve']
        old_bonding_curve = old_metrics.get('bonding_curve', {})
        
        # 1. New cycle alert
        new_cycle = bonding_curve['shares_in_cycle'] < 100 and \
                   old_bonding_curve.get('shares_in_cycle', 0) > 4900
        if new_cycle:
            alerts.append(
                f"🎯 New Share Opportunity: {swarm_id.upper()}\n"
                f"• New cycle starting!\n"
                f"• Current price: ${bonding_curve['current_price']}\n"
                f"• 5000 shares available\n"
                f"• Market cap: ${bonding_curve['market_cap']:,}\n\n"
                f"Buy now: https://swarms.universalbasiccompute.ai/swarm/{swarm_id}"
            )

        # 2. Significant price change alert (>5%)
        price_change = bonding_curve.get('price_change_24h', 0)
        if abs(price_change) >= 0.05:
            direction = "increase" if price_change > 0 else "decrease"
            alerts.append(
                f"📊 Price Alert: {swarm_id.upper()}\n"
                f"• {abs(price_change)*100:.1f}% {direction} in 24h\n"
                f"• Current price: ${bonding_curve['current_price']}\n"
                f"• 24h volume: ${bonding_curve['volume_24h']:,}"
            )

        # 3. Revenue milestone alert
        if 'revenue' in new_metrics:
            old_revenue = old_metrics.get('revenue', {}).get('weekly', 0)
            new_revenue = new_metrics['revenue']['weekly']
            if new_revenue >= old_revenue * 1.2:  # 20% increase
                alerts.append(
                    f"💰 Revenue Milestone: {swarm_id.upper()}\n"
                    f"• Weekly revenue: ${new_revenue:,}\n"
                    f"• Growth rate: {new_metrics['revenue']['growth_rate']*100:.1f}%\n"
                    f"• Total revenue: ${new_metrics['revenue']['total']:,}"
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
                            logger.info(f"Share availability alert for {user_id}: {alerts}")
                        
                        # Update previous metrics
                        self.previous_metrics[swarm_id] = new_metrics
                
                # Check every minute for new opportunities
                await asyncio.sleep(60)
                
            except Exception as e:
                logger.error(f"Error in monitor loop: {e}")
                await asyncio.sleep(60)  # Wait 1 minute on error
