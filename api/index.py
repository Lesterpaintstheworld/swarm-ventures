from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
import os

app = FastAPI()

@app.get("/", response_class=JSONResponse)
async def home(request: Request):
    """Serve the API status"""
    return {"status": "ok", "message": "SwarmVentures API is running"}
