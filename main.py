import uvicorn
import sys
import os

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    uvicorn.run("api.notifications:app", host="0.0.0.0", port=8000, reload=True)
