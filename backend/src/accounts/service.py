import uuid

from fastapi import HTTPException, status
from sqlalchemy import and_, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from src.accounts.dao import UserDAO
from src.accounts.models import UserModel, UserRoleEnum
from src.accounts.schemas import UserUpdate, UserUpdateDB, \
    UserCreate, UserCreateDB, UserCreateAdmin, UserUpdateAdmin
from src.auth.utils import get_password_hash


class UserService:
    @classmethod
    async def create_user(
            cls,
            data: UserCreateAdmin | UserCreate,
            session: AsyncSession
    ):
        return await UserDAO.add(
            session,
            UserCreateDB(
                **data.model_dump(exclude={"password", "role"}),
                hashed_password=get_password_hash(data.password.get_secret_value()),
                role=data.role if isinstance(data, UserCreateAdmin) else UserRoleEnum.USER
            )
        )

    @classmethod
    async def get_user(cls, user_id: uuid.UUID, session: AsyncSession) -> UserModel:
        user = await UserDAO.find_one_or_none(session, *[UserModel.id == user_id, UserModel.is_deleted == False])
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user

    @classmethod
    async def update_user(cls, user_id: uuid.UUID, user: UserUpdate | UserUpdateAdmin, session: AsyncSession):
        if isinstance(user, UserUpdateAdmin):
            current_user = await cls.get_user(user_id, session)
            if user.username == current_user.username:
                del user.username
        user_update = await UserDAO.update(
            session,
            and_(UserModel.id == user_id, UserModel.is_deleted == False),
            obj_in=UserUpdateDB(
                **user.model_dump(exclude={"password"}, exclude_unset=True),
                hashed_password=get_password_hash(user.password.get_secret_value()) if user.password else None
            )
        )

        if not user_update:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        return user_update

    @classmethod
    async def get_list_users(cls, offset: int, limit: int, session: AsyncSession):
        return await UserDAO.find_all(session, UserModel.role != UserRoleEnum.ADMIN, offset=offset, limit=limit)

    @classmethod
    async def delete_user(cls, user_id: uuid.UUID, session: AsyncSession):
        user = await cls.get_user(user_id, session)
        if not user or user.is_deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        await UserDAO.update(session, UserModel.id == user.id, obj_in={'is_deleted': True})


