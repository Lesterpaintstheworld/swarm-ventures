import os
import json
import logging
import anthropic
from typing import Dict, Any
from src.prompts.system_prompt import SYSTEM_PROMPT

class ClaudeClient:
    def __init__(self):
        api_key = os.getenv('ANTHROPIC_API_KEY')
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable is not set")
            
        # Create client with minimal configuration
        self.client = anthropic.Anthropic(
            api_key=api_key,
            base_url="https://api.anthropic.com",
            default_headers={"anthropic-version": "2023-06-01"}
        )
        self.model = "claude-3-haiku-20240307"

    async def get_response(self, user_message: str, user_data: Dict[str, Any] = None) -> Dict[str, Any]:
        try:
            # Create message with minimal parameters
            message = self.client.messages.create(
                model=self.model,
                max_tokens=1024,
                system=SYSTEM_PROMPT,
                messages=[{
                    "role": "user",
                    "content": f"User data: {json.dumps(user_data)}\n\nUser message: {user_message}"
                }]
            )
            
            try:
                result = json.loads(message.content[0].text)
                if not isinstance(result, dict):
                    raise ValueError("Response not in correct format")
                return result
            except json.JSONDecodeError:
                return {
                    "user_response": message.content[0].text,
                    "airtable_op": None
                }
                
        except Exception as e:
            logging.error(f"Claude API error: {str(e)}")
            return {
                "user_response": "I'm having temporary technical difficulties. Please try again in a moment.",
                "airtable_op": None
            }
