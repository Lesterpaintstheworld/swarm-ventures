import os
import json
import logging
import anthropic
from typing import Dict, Any
from src.prompts.system_prompt import SYSTEM_PROMPT

class ClaudeClient:
    def __init__(self):
        # Remove any proxy settings that might be in the environment
        api_key = os.getenv('ANTHROPIC_API_KEY')
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable is not set")
            
        self.client = anthropic.Anthropic(
            api_key=api_key
        )
        self.model = "claude-3-haiku-20240307"

    async def get_response(self, user_message: str, user_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Get both user response and Airtable operation from Claude
        Returns: {
            'user_response': str,  # Message to send to user
            'airtable_op': dict   # Airtable operation to perform (if any)
        }
        """
        try:
            message = self.client.messages.create(
                model=self.model,
                max_tokens=1024,
                messages=[
                    {
                        "role": "system",
                        "content": SYSTEM_PROMPT
                    },
                    {
                        "role": "user",
                        "content": f"User data: {json.dumps(user_data)}\n\nUser message: {user_message}"
                    }
                ]
            )
            
            # Parse response content as JSON
            try:
                result = json.loads(message.content)
                if not isinstance(result, dict):
                    raise ValueError("Response not in correct format")
                return result
            except json.JSONDecodeError:
                # If response isn't valid JSON, create a basic response
                return {
                    "user_response": message.content,
                    "airtable_op": None
                }
                
        except Exception as e:
            logging.error(f"Claude API error: {str(e)}")
            return {
                "user_response": "I'm having temporary technical difficulties. Please try again in a moment.",
                "airtable_op": None
            }
