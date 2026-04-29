import random
import string
from fastapi import HTTPException

from sqlalchemy.ext.asyncio import AsyncSession

from src.accounts.models import UserModel
from src.teams.dao import TeamDAO
from src.teams.models import TeamModel, TeamMemberModel
from src.teams.schemas import TeamCreate, TeamCreateDB


class TeamService:
    MAX_TEAM_MEMBERS = 6

    @classmethod
    async def get(cls, session: AsyncSession, user: UserModel):
        return await TeamDAO.find_one_or_none(session, TeamMemberModel.user_id == user.id)

    @classmethod
    async def join_team(cls, session: AsyncSession, user: UserModel, code: str):
        team = await TeamDAO.find_one_or_none(session, TeamModel.join_code == code)
        if not team:
            raise HTTPException(404, detail="Team not found")

        members_count = await TeamDAO.count_members(session, team.id)
        if members_count >= cls.MAX_TEAM_MEMBERS:
            raise HTTPException(400, detail=f"Team size limit is {cls.MAX_TEAM_MEMBERS} members")

        return await TeamDAO.add_member(session, {
            "user_id": user.id,
            "team_id": team.id
        })


    @classmethod
    async def create(cls, session: AsyncSession, user: UserModel, data: TeamCreate):
        join_code = ''.join(random.choices(string.ascii_letters + string.digits, k=8))

        return await TeamDAO.add(session, TeamCreateDB(
            name=data.name,
            owner_id=user.id,
            join_code=join_code,
            description=data.description,
        ))

