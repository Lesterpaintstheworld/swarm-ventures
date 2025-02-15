from solana.rpc.async_api import AsyncClient
from solana.publickey import PublicKey
import asyncio
import json
import base64
from typing import List, Dict

class SecondaryMarketClient:
    def __init__(self, rpc_url: str = "https://api.mainnet-beta.solana.com"):
        self.client = AsyncClient(rpc_url)
        # Program ID for the launchpad (you'll need to replace this with the actual program ID)
        self.program_id = PublicKey("your_program_id_here")
        
    async def get_all_listings(self) -> List[Dict]:
        try:
            # Get all accounts owned by the program
            response = await self.client.get_program_accounts(
                self.program_id,
                encoding="base64",
                filters=[
                    {
                        "memcmp": {
                            "offset": 0,
                            # This is the account discriminator for ShareListing
                            "bytes": base64.b64encode(b"ShareListing").decode("ascii")
                        }
                    }
                ]
            )
            
            listings = []
            for account in response["result"]:
                try:
                    listing_data = self._decode_listing_data(account["account"]["data"][0])
                    listing = {
                        "id": listing_data["listing_id"],
                        "swarm_id": str(listing_data["pool"]),
                        "number_of_shares": listing_data["number_of_shares"],
                        "price_per_share": listing_data["price_per_share"],
                        "seller": str(listing_data["seller"]),
                        "total_price": listing_data["number_of_shares"] * listing_data["price_per_share"],
                        "token": {
                            "label": "$COMPUTE",
                            "icon": "/tokens/compute.svg"
                        }
                    }
                    listings.append(listing)
                except Exception as e:
                    print(f"Error decoding listing: {e}")
                    continue
                    
            return listings
            
        except Exception as e:
            print(f"Error fetching listings: {e}")
            return []
            
    def _decode_listing_data(self, base64_data: str) -> Dict:
        """
        Decode the account data from base64
        You'll need to implement the actual decoding logic based on your account structure
        """
        data = base64.b64decode(base64_data)
        # Implement your decoding logic here based on the account structure
        # This is a placeholder - you'll need to adjust based on your actual data structure
        return {
            "listing_id": "...",
            "pool": PublicKey("..."),
            "number_of_shares": 0,
            "price_per_share": 0,
            "seller": PublicKey("...")
        }

async def main():
    client = SecondaryMarketClient()
    listings = await client.get_all_listings()
    
    # Print listings in a formatted way
    print("\nSecondary Market Listings:")
    print("-" * 80)
    for listing in listings:
        print(f"Listing ID: {listing['id']}")
        print(f"Swarm: {listing['swarm_id']}")
        print(f"Shares: {listing['number_of_shares']:,}")
        print(f"Price/Share: {listing['price_per_share']:,} $COMPUTE")
        print(f"Total Price: {listing['total_price']:,} $COMPUTE")
        print(f"Seller: {listing['seller']}")
        print("-" * 80)

if __name__ == "__main__":
    asyncio.run(main())
