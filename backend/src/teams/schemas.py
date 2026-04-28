import uuid

from pydantic import BaseModel, Field


class TeamBase(BaseModel):
    name: str
    description: str


class TeamCreate(TeamBase):
    pass


class TeamCreateDB(TeamCreate):
    owner_id: uuid.UUID
    join_code: str


class TeamJoin(BaseModel):
    code: str = Field(..., min_length=8, max_length=8)
