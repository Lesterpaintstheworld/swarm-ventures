import os
import json
import logging
import httpx
from typing import Dict, Any
from src.prompts.system_prompt import SYSTEM_PROMPT

class ClaudeClient:
    def __init__(self):
        # Add debug logging
        logging.info("Initializing ClaudeClient")
        
        self.api_key = os.getenv('ANTHROPIC_API_KEY')
        logging.info(f"API key found: {'Yes' if self.api_key else 'No'}")
        
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable is not set")
            
        # Ensure API key has proper format and log masked version
        if not self.api_key.startswith('sk-'):
            self.api_key = f"sk-{self.api_key}"
        
        # Log masked version of API key for debugging
        masked_key = f"{self.api_key[:5]}...{self.api_key[-4:]}"
        logging.info(f"Using API key: {masked_key}")
            
        self.base_url = "https://api.anthropic.com/v1/messages"
        self.model = "claude-3-haiku-20240307"
        self.headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2024-02-01",  # Updated API version
            "content-type": "application/json",
            "accept": "application/json"
        }

    async def get_response(self, user_message: str, user_data: Dict[str, Any] = None) -> Dict[str, Any]:
        try:
            # Create message payload
            payload = {
                "model": self.model,
                "max_tokens": 1024,
                "messages": [
                    {
                        "role": "system",
                        "content": SYSTEM_PROMPT
                    },
                    {
                        "role": "user",
                        "content": f"User data: {json.dumps(user_data)}\n\nUser message: {user_message}"
                    }
                ]
            }
            
            logging.info(f"Making request to Claude API with headers: {self.headers}")
            
            # Make API request
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.base_url,
                    headers=self.headers,
                    json=payload,
                    timeout=30.0
                )
                
                if response.status_code != 200:
                    logging.error(f"Claude API error response: {response.text}")
                    raise Exception(f"API error: {response.status_code} - {response.text}")
                
                data = response.json()
                response_text = data['content'][0]['text']
                
                try:
                    result = json.loads(response_text)
                    if not isinstance(result, dict):
                        raise ValueError("Response not in correct format")
                    return result
                except json.JSONDecodeError:
                    return {
                        "user_response": response_text,
                        "airtable_op": None
                    }
                
        except Exception as e:
            logging.error(f"Claude API error: {str(e)}")
            return {
                "user_response": "I'm having temporary technical difficulties. Please try again in a moment.",
                "airtable_op": None
            }
