import os
import json
import logging
import anthropic
from typing import Dict, Any

class ClaudeClient:
    def __init__(self):
        self.client = anthropic.Client(api_key=os.getenv('ANTHROPIC_API_KEY'))
        self.model = "claude-3-haiku-20240307"
        self.system_prompt = {
            "role": "AI Trading Assistant",
            "capabilities": [
                "Portfolio tracking",
                "Swarm analysis", 
                "Alert management",
                "User support"
            ],
            "response_format": {
                "user_response": "Natural language reply",
                "airtable_op": {
                    "operation": "Operation name",
                    "params": "Operation parameters"
                }
            },
            "business_rules": {
                "free_trial": "2 swarms",
                "subscription": "1000 USDC minimum",
                "tokens": ["USDC", "USDT", "SOL", "UBC"]
            },
            "available_operations": [
                "get_user",
                "create_user", 
                "add_to_watchlist",
                "remove_from_watchlist",
                "update_preferences"
            ]
        }

    async def get_response(self, user_message: str, user_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Get both user response and Airtable operation from Claude
        Returns: {
            'user_response': str,  # Message to send to user
            'airtable_op': dict   # Airtable operation to perform (if any)
        }
        """
        system_prompt = f"""You are an AI Trading Assistant for UBC Swarm investments.

        Your capabilities:
        {self.system_prompt['capabilities']}

        Business Rules:
        - Free trial allows {self.system_prompt['business_rules']['free_trial']}
        - Subscription requires {self.system_prompt['business_rules']['subscription']}
        - Supported tokens: {', '.join(self.system_prompt['business_rules']['tokens'])}

        Available operations:
        {self.system_prompt['available_operations']}

        Response must be valid JSON with:
        1. user_response: Natural language reply to user
        2. airtable_op: Operation details (if needed)

        Handle errors gracefully with:
        - Typo correction
        - Intent recognition
        - Clear error messages
        - Helpful suggestions"""

        # Prepare context with user data
        context = {
            "user_data": user_data,
            "message": user_message
        }
        
        try:
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=1000,
                system=system_prompt,
                messages=[{
                    "role": "user", 
                    "content": f"User data: {json.dumps(context['user_data'])}\n\nUser message: {context['message']}"
                }]
            )
            
            # Validate response format
            result = response.content
            if not isinstance(result, dict):
                return {
                    "user_response": "I apologize, but I'm having trouble processing your request. Please try again.",
                    "airtable_op": None
                }
                
            if "user_response" not in result:
                result["user_response"] = "I understood your request but had trouble formatting the response. Please try again."
                
            return result
            
        except Exception as e:
            logging.error(f"Claude API error: {str(e)}")
            return {
                "user_response": "I'm having temporary technical difficulties. Please try again in a moment.",
                "airtable_op": None
            }
