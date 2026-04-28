from fastapi import APIRouter, Depends

from pydantic import Field

from src.database import SessionDep
from src.accounts.models import UserModel
from src.auth.dependencies import get_current_user
from src.teams.schemas import TeamCreate, TeamJoin
from src.teams.service import TeamService

router = APIRouter()


@router.get("")
async def get_teams(
        session: SessionDep,
        user: UserModel = Depends(get_current_user),
):
    return await TeamService.get(session, user)


@router.post("/join")
async def join_team(
        session: SessionDep,
        data: TeamJoin,
        user: UserModel = Depends(get_current_user)
):
    return await TeamService.join_team(session, user, data.code)


@router.post("")
async def create_team(
        session: SessionDep,
        data: TeamCreate,
        user: UserModel = Depends(get_current_user),
):
    return await TeamService.create(session, user, data)
