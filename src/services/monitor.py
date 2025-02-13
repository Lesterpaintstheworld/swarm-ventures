import asyncio
import logging
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
            'bonding_curve': {
                'current_cycle': 3,  # Current 5000-share cycle
                'shares_in_cycle': 2500,  # Shares sold in current cycle
                'current_price': 2.4,  # Current price from bonding curve
                'next_price': 3.24  # Price after cycle completion
            }
        }
    
    async def generate_alerts(self, user_id: str, swarm_id: str, old_metrics: dict, new_metrics: dict):
        """Generate alerts for new cheap shares"""
        alerts = []
        
        # Check if a new cycle is starting (shares_in_cycle close to 0)
        new_cycle = new_metrics['bonding_curve']['shares_in_cycle'] < 100 and \
                    old_metrics.get('bonding_curve', {}).get('shares_in_cycle', 0) > 4900
        
        if new_cycle:
            alerts.append(
                f"🎯 New Share Opportunity: {swarm_id.upper()}\n"
                f"• New cycle starting!\n"
                f"• Current price: ${new_metrics['bonding_curve']['current_price']}\n"
                f"• 5000 shares available\n\n"
                f"Buy now: https://swarms.universalbasiccompute.ai/swarm/{swarm_id}"
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
