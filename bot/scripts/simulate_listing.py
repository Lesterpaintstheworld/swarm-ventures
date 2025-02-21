import random
import time
import json
import requests

def simulate_listing():
    # Available swarms for simulation
    swarms = ['kinos', 'xforge', 'kinkong']
    selected_swarm = random.choice(swarms)
    
    # Generate random listing data
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

    print("\nSimulating listing:")
    print(json.dumps(notification_data, indent=2))

    try:
        response = requests.post(
            'https://swarmventures.universalbasiccompute.ai/api/notify-new-listing',
            json=notification_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            print("\nAPI Response:")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"\nAPI Error: {response.status_code}")
            print(response.text)

    except Exception as e:
        print(f"\nError calling API: {e}")

def simulate_multiple_listings(count=5, delay_seconds=10):
    for i in range(count):
        print(f"\nSimulating listing {i+1} of {count}")
        simulate_listing()
        if i < count - 1:
            print(f"\nWaiting {delay_seconds} seconds...")
            time.sleep(delay_seconds)

if __name__ == "__main__":
    simulate_multiple_listings()
