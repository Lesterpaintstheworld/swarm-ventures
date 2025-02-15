from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
import os
import time
import json

app = FastAPI()

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    print(json.dumps({
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "method": request.method,
        "path": request.url.path,
        "process_time": f"{process_time:.2f}s",
        "client_ip": request.client.host
    }))
    response.headers["X-Process-Time"] = str(process_time)
    return response

@app.get("/", response_class=JSONResponse)
async def home(request: Request):
    """Serve the API status"""
    print(json.dumps({
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "event": "api_status_check",
        "status": "ok"
    }))
    return {"status": "ok", "message": "SwarmVentures API is running"}
