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
        # For now return mock data
        return {
            'price': 100,
            'weekly_revenue': 1000,
            'shares_available': 100
        }
    
    async def generate_alerts(self, user_id: str, swarm_id: str, old_metrics: dict, new_metrics: dict):
        """Generate alerts based on metric changes"""
        alerts = []
        
        # Price change alert
        if old_metrics.get('price'):
            price_change = ((new_metrics['price'] - old_metrics['price']) / old_metrics['price']) * 100
            if abs(price_change) >= 5:  # 5% threshold
                alerts.append(
                    f"💰 {swarm_id.upper()}: Price changed by {price_change:.1f}%\n"
                    f"New price: ${new_metrics['price']:,.2f}"
                )
        
        # Revenue alert
        if old_metrics.get('weekly_revenue'):
            rev_change = ((new_metrics['weekly_revenue'] - old_metrics['weekly_revenue']) 
                         / old_metrics['weekly_revenue']) * 100
            if abs(rev_change) >= 10:  # 10% threshold
                alerts.append(
                    f"📈 {swarm_id.upper()}: Weekly revenue changed by {rev_change:.1f}%\n"
                    f"New revenue: ${new_metrics['weekly_revenue']:,.2f}"
                )
        
        # Shares availability alert
        if new_metrics['shares_available'] > old_metrics.get('shares_available', 0):
            alerts.append(
                f"🔔 {swarm_id.upper()}: New shares available!\n"
                f"Available: {new_metrics['shares_available']:,}"
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
