import os
import json
import logging
import httpx
from typing import Dict, Any
from src.prompts.system_prompt import SYSTEM_PROMPT

class ClaudeClient:
    def __init__(self):
        # Force load from the specific .env file in project root
        import os
        from dotenv import load_dotenv
        
        # Get the absolute path to the project root's .env file
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        env_path = os.path.join(project_root, '.env')
        
        logging.info(f"Loading .env from: {env_path}")
        load_dotenv(env_path, override=True)  # Force override with our specific .env file
        
        self.api_key = os.getenv('ANTHROPIC_API_KEY')
        if not self.api_key:
            raise ValueError(f"ANTHROPIC_API_KEY not found in {env_path}")
            
        # Ensure API key has proper format and log masked version
        if not self.api_key.startswith('sk-'):
            self.api_key = f"sk-{self.api_key}"
        
        # Mask API key in logs - only show first 5 and last 4 chars
        masked_key = f"{self.api_key[:5]}...{self.api_key[-4:]}" if self.api_key else "None"
        logging.info(f"Using API key: {masked_key}")
            
        self.base_url = "https://api.anthropic.com/v1/messages"
        self.model = "claude-3-haiku-20240307"
        # Create headers without logging them
        self.headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
            "accept": "application/json"
        }

    async def get_response(self, user_message: str, user_data: Dict[str, Any] = None) -> Dict[str, Any]:
        try:
            payload = {
                "model": self.model,
                "max_tokens": 1024,
                "system": SYSTEM_PROMPT,
                "messages": [
                    {
                        "role": "user",
                        "content": f"User data: {json.dumps(user_data)}\n\nUser message: {user_message}"
                    }
                ]
            }
            
            logging.info("Making request to Claude API")
            
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
                response_text = data['content'][0]['text'].strip()
                
                # Find the JSON part of the response
                try:
                    start_idx = response_text.rfind('{')  # Find last occurrence of {
                    if start_idx != -1:
                        json_str = response_text[start_idx:]  # Extract from last { to end
                        parsed = json.loads(json_str)
                        if isinstance(parsed, dict) and 'user_response' in parsed:
                            return parsed
                except json.JSONDecodeError:
                    logging.error(f"Failed to parse response as JSON: {response_text}")
                
                # If we can't parse JSON, use the whole response as user_response
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
