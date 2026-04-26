import datetime
import uuid
from typing import Optional

from pydantic import BaseModel, Field, SecretStr

from src.accounts.schemas import UserResponse


class RefreshSessionCreate(BaseModel):
    refresh_token: uuid.UUID
    access_token: str
    expires_at: datetime.datetime
    user_id: uuid.UUID


class RefreshSessionUpdate(RefreshSessionCreate):
    user_id: Optional[uuid.UUID] = Field(None)


class AuthResponse(BaseModel):
    user: UserResponse
    access_token: str
    refresh_token: uuid.UUID
    token_type: str


class Credentials(BaseModel):
    username: str
    password: SecretStr


class Refresh(BaseModel):
    refreshToken: uuid.UUID
