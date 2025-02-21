import random
import asyncio
import json
from datetime import datetime
import os
import sys
import aiohttp

async def simulate_listing():
    # Available swarms for simulation
    swarms = ['kinos', 'xforge', 'kinkong']
    selected_swarm = random.choice(swarms)
    
    # Generate random listing data in the correct format
    notification_data = {
        "listing": {
            "id": f"L{random.randint(100000, 999999)}",
            "seller": "DYw8jCTfwHNRJhhmFcbXvVDTqWrnnfkDHKd4RkRdrF2M",
            "numberOfShares": random.randint(10, 1000),
            "pricePerShare": round(random.uniform(10, 15), 2),
            "desiredToken": "USDC"
        },
        "swarm": {
            "id": selected_swarm,
            "name": selected_swarm.capitalize(),
            "image": f"https://example.com/{selected_swarm}.jpg"
        }
    }

    # Print the simulated listing
    print("\nSimulating listing:")
    print(json.dumps(notification_data, indent=2))

    try:
        # Call the API
        async with aiohttp.ClientSession() as session:
            async with session.post(
                'https://swarmventures.universalbasiccompute.ai/api/notify-new-listing',
                json=notification_data,
                headers={'Content-Type': 'application/json'}
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    print("\nAPI Response:")
                    print(json.dumps(result, indent=2))
                else:
                    print(f"\nAPI Error: {response.status}")
                    error_text = await response.text()
                    print(error_text)

    except Exception as e:
        print(f"\nError calling API: {e}")

async def simulate_multiple_listings(count=5, delay_seconds=10):
    for i in range(count):
        print(f"\nSimulating listing {i+1} of {count}")
        await simulate_listing()
        if i < count - 1:  # Don't delay after the last one
            print(f"\nWaiting {delay_seconds} seconds...")
            await asyncio.sleep(delay_seconds)

if __name__ == "__main__":
    asyncio.run(simulate_multiple_listings())
