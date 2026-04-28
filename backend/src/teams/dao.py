from typing import Optional, Union, Dict, Any

from fastapi import HTTPException
from sqlalchemy import select, insert
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from src.exceptions import DatabaseException, UnknownDatabaseException


from src.dao import BaseDAO
from .models import TeamModel, TeamMemberModel
from .schemas import TeamCreateDB


class TeamDAO(BaseDAO[TeamModel, TeamCreateDB, None]):
    model = TeamModel

    @classmethod
    async def find_all(
            cls,
            session: AsyncSession,
            *filters,
            offset: int = 0,
            limit: int = 100,
            order_by: str = None,
            **filter_by,
    ):
        stmt = (
            select(cls.model)
            .join(TeamMemberModel)
            .filter(*filters)
            .filter_by(**filter_by)
            .offset(offset)
            .limit(limit)
            .order_by(order_by)
        )
        result = await session.execute(stmt)
        return result.scalars().all()

    @classmethod
    async def find_one_or_none(
            cls,
            session: AsyncSession,
            *filters,
            **filter_by
    ) -> Optional[TeamModel]:
        stmt = select(cls.model).filter(*filters).filter_by(**filter_by).options(
                selectinload(cls.model.team_members)
                .selectinload(TeamMemberModel.user)
            )
        result = await session.execute(stmt)
        return result.scalars().one_or_none()

    @classmethod
    async def add(
            cls,
            session: AsyncSession,
            obj_in: Union[TeamCreateDB, Dict[str, Any]],
    ) -> Optional[TeamModel]:
        if isinstance(obj_in, dict):
            create_data = obj_in
        else:
            create_data = obj_in.model_dump(exclude_unset=True)

        try:
            stmt = insert(cls.model).values(**create_data).returning(cls.model)
            res = await session.execute(stmt)
            result = res.scalars().first()
            stmt = insert(TeamMemberModel).values(**{
                "user_id": result.owner_id,
                "team_id": result.id
            })
            await session.execute(stmt)
            return result
        except IntegrityError as e:
            constraint = getattr(e.orig.__cause__, "constraint_name", None)

            if constraint == "teams_name_key":
                raise HTTPException(
                    status_code=400,
                    detail="This team name is already busy",
                )

            if constraint == "uq_user_team":
                raise HTTPException(
                    status_code=400,
                    detail="The user already has a command",
                )

            raise HTTPException(
                status_code=400,
                detail="Integrity error",
            )
        except SQLAlchemyError as e:
            print(e)
            raise DatabaseException
        except Exception as e:
            print(e)
            raise UnknownDatabaseException

    @classmethod
    async def add_member(
            cls,
            session: AsyncSession,
            obj_in: Union[TeamCreateDB, Dict[str, Any]],
    ) -> Optional[TeamModel]:
        if isinstance(obj_in, dict):
            create_data = obj_in
        else:
            create_data = obj_in.model_dump(exclude_unset=True)

        try:
            stmt = insert(TeamMemberModel).values(**create_data)
            await session.execute(stmt)
        except IntegrityError as e:
            raise HTTPException(
                status_code=400,
                detail="The user already has a command",
            )
        except SQLAlchemyError as e:
            print(e)
            raise DatabaseException
        except Exception as e:
            print(e)
            raise UnknownDatabaseException
