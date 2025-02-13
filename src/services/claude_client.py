import os
import anthropic
from typing import Dict, Any

class ClaudeClient:
    def __init__(self):
        self.client = anthropic.Client(api_key=os.getenv('ANTHROPIC_API_KEY'))
        self.model = "claude-3-haiku-20240307"

    async def get_response(self, user_message: str, user_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Get both user response and Airtable operation from Claude
        Returns: {
            'user_response': str,  # Message to send to user
            'airtable_op': dict   # Airtable operation to perform (if any)
        }
        """
        system_prompt = """You are a Telegram bot for UBC Swarm investments. 
        Generate two things:
        1. A helpful response to the user
        2. The corresponding Airtable operation (if needed)
        
        Available Airtable operations:
        - get_user
        - create_user
        - add_to_watchlist
        - remove_from_watchlist
        - update_preferences
        
        First 2 swarm additions are free, then subscription required.
        Format response as JSON with 'user_response' and 'airtable_op' keys."""

        context = f"User data: {user_data}\n\nUser message: {user_message}"
        
        response = await self.client.messages.create(
            model=self.model,
            max_tokens=1000,
            system=system_prompt,
            messages=[{"role": "user", "content": context}]
        )
        
        return response.content
