from typing import Optional, Union, Dict, Any

from fastapi import HTTPException

from sqlalchemy import select, insert, update, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload
from sqlalchemy.exc import SQLAlchemyError, IntegrityError

from src.exceptions import DatabaseException, UnknownDatabaseException, ConflictUniqueAttribute
from src.accounts.models import UserModel
from src.accounts.schemas import UserCreateDB, UserUpdateDB
from src.dao import BaseDAO


class UserDAO(BaseDAO[UserModel, UserCreateDB, UserUpdateDB]):
    model = UserModel

    @classmethod
    async def find_one_or_none(
            cls,
            session: AsyncSession,
            *filters,
            **filter_by
    ) -> Optional[UserModel]:
        stmt = select(cls.model).filter(*filters).filter_by(**filter_by)
        result = await session.execute(stmt)
        return result.scalars().one_or_none()

    @classmethod
    async def add(
            cls,
            session: AsyncSession,
            obj_in: Union[UserCreateDB, Dict[str, Any]],
    ) -> Optional[UserModel]:
        if isinstance(obj_in, dict):
            create_data = obj_in
        else:
            create_data = obj_in.model_dump(exclude_unset=True)

        try:
            stmt = insert(cls.model).values(**create_data).returning(cls.model)
            result = await session.execute(stmt)
            return result.scalars().first()
        except IntegrityError as e:
            raise HTTPException(status_code=400, detail="This username is already busy")
        except SQLAlchemyError:
            raise DatabaseException
        except Exception:
            raise UnknownDatabaseException

    @classmethod
    async def find_all(
            cls,
            session: AsyncSession,
            *filters,
            offset: int = 0,
            limit: int = 100,
            **filter_by
    ):
        stmt = (
            select(cls.model)
            .filter(*filters)
            .filter_by(**filter_by)
            .offset(offset)
            .limit(limit)
            .order_by()
        )
        result = await session.execute(stmt)
        return result.scalars().all()

    @classmethod
    async def update(
            cls,
            session: AsyncSession,
            *where,
            obj_in: Union[UserUpdateDB, Dict[str, Any]],
    ) -> Optional[UserModel]:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True, exclude_none=True)
        try:
            stmt = update(cls.model).where(*where).values(**update_data).returning(cls.model)
            result = await session.execute(stmt)
            return result.scalars().one_or_none()
        except IntegrityError as e:
            raise HTTPException(status_code=400, detail="This username is already busy")
        except SQLAlchemyError:
            raise DatabaseException
        except Exception:
            raise UnknownDatabaseException

