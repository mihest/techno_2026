import uuid
from typing import Optional

from fastapi import HTTPException
from pydantic import BaseModel, SecretStr, field_validator, Field, model_validator
from pydantic_core.core_schema import ValidationInfo

from src.accounts.models import UserRoleEnum


class UserBase(BaseModel):
    username: str = Field(..., min_length=5)
    age_group_id: uuid.UUID
    nickname: str = Field(..., min_length=5)


class UserCreate(UserBase):
    password: SecretStr
    confirm_password: SecretStr

    @field_validator("password", "confirm_password")
    @classmethod
    def validate_password(cls, v: SecretStr):
        if len(v.get_secret_value()) < 5:
            raise ValueError("Password must be at least 5 characters long")
        return v

    @field_validator("confirm_password")
    @classmethod
    def validate_confirm_password(cls, v: SecretStr, info: ValidationInfo):
        if "password" in info.data and v.get_secret_value() != info.data["password"].get_secret_value():
            raise ValueError("Passwords do not match")
        return v


class UserCreateAdmin(UserCreate):
    role: UserRoleEnum


class UserCreateDB(UserBase):
    hashed_password: str
    role: UserRoleEnum


class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[SecretStr] = None
    confirm_password: Optional[SecretStr] = None

    @field_validator("password", "confirm_password")
    @classmethod
    def validate_password(cls, v: SecretStr):
        if len(v.get_secret_value()) < 5:
            raise ValueError("Password must be at least 5 characters long")
        return v

    @model_validator(mode="after")
    def check_passwords_match(self):
        password = self.password
        confirm_password = self.confirm_password

        if password is None and confirm_password is None:
            return self

        if password is not None and confirm_password is None:
            raise HTTPException(
                status_code=422,
                detail=[{
                    "type": "value_error",
                    "loc": ["body", "confirm_password"],
                    "msg": "Confirm password required"
                }]
            )

        if password.get_secret_value() != confirm_password.get_secret_value():
            raise HTTPException(
                status_code=422,
                detail=[{
                    "type": "value_error",
                    "loc": ["body", "confirm_password"],
                    "msg": "Passwords do not match"
                }]
            )
        return self


class UserUpdateAdmin(UserUpdate):
    role: Optional[UserRoleEnum] = None


class UserUpdateDB(BaseModel):
    username: Optional[str] = None
    hashed_password: Optional[str] = None
    role: Optional[UserRoleEnum] = None


class UserResponse(BaseModel):
    id: uuid.UUID
    username: str
    role: UserRoleEnum
    is_deleted: bool


class UserMeResponse(UserResponse):
    quests_completed: int
    rating: int
    published_routes_count: int


class SoloLeaderboardItem(BaseModel):
    user_id: uuid.UUID
    username: str
    completed_quests: int
    rating: int
    average_time_minutes: int | None = None


class TeamLeaderboardItem(BaseModel):
    team_id: uuid.UUID
    team_name: str
    completed_quests: int
    rating: int
    average_time_minutes: int | None = None
