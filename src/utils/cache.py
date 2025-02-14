from functools import lru_cache
import time
from typing import Any, Dict

@lru_cache(maxsize=100)
def get_cached_swarm_data(swarm_id: str, timestamp: int) -> Dict[str, Any]:
    """Cache swarm data with timestamp-based invalidation"""
    from src.services.monitor import SWARM_PRICES
    return {
        'price': SWARM_PRICES.get(swarm_id.split('_')[0], 0),
        'timestamp': timestamp
    }

def get_cache_timestamp() -> int:
    """Get current timestamp rounded to nearest minute"""
    return int(time.time() / 60)
