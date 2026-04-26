
import uvicorn

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

from . import all_routers


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