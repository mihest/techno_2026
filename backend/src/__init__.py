from fastapi import APIRouter

from .auth.router import router as auth_router
from .accounts.router import router as accounts_router
from .teams.router import router as teams_router
from .quests.router import router as quests_router
from .quest_sessions.router import router as quest_sessions_router

all_routers = APIRouter()

all_routers.include_router(
    auth_router,
    prefix='/auth',
    tags=['Authentication']
)

all_routers.include_router(
    accounts_router,
    prefix='/accounts'
)

all_routers.include_router(
    teams_router,
    prefix='/teams'
)

all_routers.include_router(
    quests_router,
    prefix='/quests'
)

all_routers.include_router(
    quest_sessions_router,
)
