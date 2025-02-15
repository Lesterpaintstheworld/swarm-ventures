from solana.rpc.async_api import AsyncClient
from solders.pubkey import Pubkey as PublicKey
import asyncio
import json
import base64
import struct
from typing import List, Dict

class SecondaryMarketClient:
    def __init__(self, rpc_url: str = "https://api.mainnet-beta.solana.com"):
        self.client = AsyncClient(rpc_url)
        # Program ID from the IDL
        self.program_id = PublicKey("4dWhc3nkP4WeQkv7ws4dAxp6sNTBLCuzhTGTf1FynDcf")
        
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
                            # ShareListing discriminator from IDL
                            "bytes": base64.b64encode(bytes([38, 219, 182, 80, 137, 29, 254, 143])).decode("ascii")
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
                        "shareholder": str(listing_data["shareholder"]),
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
        Decode the ShareListing account data based on the IDL structure:
        {
            pool: PublicKey,
            seller: PublicKey,
            shareholder: PublicKey,
            numberOfShares: u64,
            pricePerShare: u64,
            listingId: string
        }
        """
        data = base64.b64decode(base64_data)
        
        # Skip 8 bytes discriminator
        offset = 8
        
        # Read pool PublicKey (32 bytes)
        pool = PublicKey(data[offset:offset+32])
        offset += 32
        
        # Read seller PublicKey (32 bytes)
        seller = PublicKey(data[offset:offset+32])
        offset += 32
        
        # Read shareholder PublicKey (32 bytes)
        shareholder = PublicKey(data[offset:offset+32])
        offset += 32
        
        # Read numberOfShares (u64 - 8 bytes)
        number_of_shares = int.from_bytes(data[offset:offset+8], 'little')
        offset += 8
        
        # Read pricePerShare (u64 - 8 bytes)
        price_per_share = int.from_bytes(data[offset:offset+8], 'little')
        offset += 8
        
        # Read listingId string length (4 bytes)
        string_length = int.from_bytes(data[offset:offset+4], 'little')
        offset += 4
        
        # Read listingId string
        listing_id = data[offset:offset+string_length].decode('utf-8')
        
        return {
            "pool": pool,
            "seller": seller,
            "shareholder": shareholder,
            "number_of_shares": number_of_shares,
            "price_per_share": price_per_share,
            "listing_id": listing_id
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
        print(f"Shareholder: {listing['shareholder']}")
        print("-" * 80)

if __name__ == "__main__":
    asyncio.run(main())
