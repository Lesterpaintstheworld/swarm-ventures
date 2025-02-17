import random
import asyncio
import httpx
import json

async def simulate_listing():
    # Available swarms for simulation
    swarms = ['kinos', 'xforge', 'kinkong']
    
    # Generate random listing data
    listing = {
        "swarm_id": random.choice(swarms),
        "number_of_shares": random.randint(10, 1000),
        "price_per_share": round(random.uniform(10, 15), 2),
        "seller": "ABC...XYZ",
        "listing_id": f"L{random.randint(100000, 999999)}",
        "token": {
            "label": "USDC",
            "icon": "/tokens/usdc.svg"
        }
    }
    
    # Calculate total price
    listing["total_price"] = round(listing["number_of_shares"] * listing["price_per_share"], 2)

    # Print the simulated listing
    print("\nSimulating listing:")
    print(json.dumps(listing, indent=2))

    try:
        async with httpx.AsyncClient() as client:
            # Call the notifications endpoint
            response = await client.post(
                "http://localhost:8000/api/notify-new-listing",
                json=listing
            )
            
            result = response.json()
            print("\nNotification Result:")
            print(json.dumps(result, indent=2))
            print(f"\nNotifications sent: {result.get('notifications_sent', 0)}")
            
    except Exception as e:
        print(f"\nError: {e}")

async def simulate_multiple_listings(count=5, delay_seconds=10):
    for i in range(count):
        print(f"\nSimulating listing {i+1} of {count}")
        await simulate_listing()
        if i < count - 1:  # Don't delay after the last one
            print(f"\nWaiting {delay_seconds} seconds...")
            await asyncio.sleep(delay_seconds)

if __name__ == "__main__":
    asyncio.run(simulate_multiple_listings())
