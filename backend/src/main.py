
import uvicorn

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from . import all_routers
from .config import BaseDir


app = FastAPI(
    title="Backend",
    docs_url='/ui-swagger',
    openapi_url="/openapi.json",
    root_path="/api",
    # lifespan=lifespan
)

app.include_router(
    all_routers,
    # prefix='/api',
)

media_dir = BaseDir / "media"
media_dir.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=media_dir), name="media")
# Also expose static files behind API prefix for reverse proxies.
app.mount("/api/media", StaticFiles(directory=media_dir), name="media_api")

# app.add_middleware(LogRequestsMiddleware)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods='*',
    allow_headers='*',
)

if __name__ == '__main__':
    uvicorn.run("src.main:app", host='0.0.0.0', port=8081, log_level='info', reload=True)