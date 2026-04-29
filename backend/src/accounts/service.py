import uuid

from fastapi import HTTPException, status
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.accounts.dao import UserDAO
from src.accounts.models import UserModel, UserRoleEnum
from src.accounts.schemas import UserUpdate, UserUpdateDB, \
    UserCreate, UserCreateDB, UserCreateAdmin, UserUpdateAdmin, UserMeResponse
from src.auth.utils import get_password_hash
from src.quest_sessions.models import QuestSession, QuestSessionStatusEnum, QuestSessionCheckpointAttempt, QuestSessionModeEnum
from src.quests.models import Quest, QuestStatusEnum
from src.teams.models import TeamMemberModel, TeamModel
from src.accounts.schemas import SoloLeaderboardItem, TeamLeaderboardItem


class UserService:
    @classmethod
    async def _get_user_team_id(cls, user_id: uuid.UUID, session: AsyncSession):
        team_stmt = select(TeamMemberModel.team_id).where(TeamMemberModel.user_id == user_id)
        team_result = await session.execute(team_stmt)
        return team_result.scalar_one_or_none()

    @classmethod
    async def get_me(cls, user: UserModel, session: AsyncSession) -> UserMeResponse:
        team_id = await cls._get_user_team_id(user.id, session)

        session_filters = [QuestSession.owner_user_id == user.id]
        if team_id is not None:
            session_filters.append(QuestSession.owner_team_id == team_id)

        completed_stmt = (
            select(func.count())
            .select_from(QuestSession)
            .where(
                QuestSession.status == QuestSessionStatusEnum.COMPLETED,
                or_(*session_filters),
            )
        )
        completed_result = await session.execute(completed_stmt)
        quests_completed = int(completed_result.scalar() or 0)

        rating_stmt = (
            select(func.count())
            .select_from(QuestSessionCheckpointAttempt)
            .join(QuestSession, QuestSession.id == QuestSessionCheckpointAttempt.session_id)
            .where(
                QuestSessionCheckpointAttempt.is_correct.is_(True),
                or_(*session_filters),
            )
        )
        rating_result = await session.execute(rating_stmt)
        rating = int(rating_result.scalar() or 0)

        published_stmt = (
            select(func.count())
            .select_from(Quest)
            .where(
                Quest.author_id == user.id,
                Quest.status == QuestStatusEnum.PUBLISHED,
            )
        )
        published_result = await session.execute(published_stmt)
        published_routes_count = int(published_result.scalar() or 0)

        return UserMeResponse(
            id=user.id,
            username=user.username,
            role=user.role,
            is_deleted=user.is_deleted,
            quests_completed=quests_completed,
            rating=rating,
            published_routes_count=published_routes_count,
        )

    @classmethod
    async def get_created_quests(cls, user: UserModel, session: AsyncSession, offset: int, limit: int):
        where_clause = Quest.author_id == user.id
        stmt = (
            select(Quest)
            .where(where_clause)
            .order_by(Quest.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        count_stmt = select(func.count()).select_from(Quest).where(where_clause)
        result = await session.execute(stmt)
        count_result = await session.execute(count_stmt)
        return result.scalars().all(), int(count_result.scalar() or 0)

    @classmethod
    async def get_completed_quests(cls, user: UserModel, session: AsyncSession, offset: int, limit: int):
        team_id = await cls._get_user_team_id(user.id, session)
        session_filters = [QuestSession.owner_user_id == user.id]
        if team_id is not None:
            session_filters.append(QuestSession.owner_team_id == team_id)

        where_clause = and_(
            QuestSession.status == QuestSessionStatusEnum.COMPLETED,
            or_(*session_filters),
        )

        stmt = (
            select(Quest)
            .join(QuestSession, QuestSession.quest_id == Quest.id)
            .where(where_clause)
            .distinct(Quest.id)
            .order_by(Quest.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        count_stmt = (
            select(func.count(func.distinct(Quest.id)))
            .select_from(Quest)
            .join(QuestSession, QuestSession.quest_id == Quest.id)
            .where(where_clause)
        )
        result = await session.execute(stmt)
        count_result = await session.execute(count_stmt)
        return result.scalars().all(), int(count_result.scalar() or 0)

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

    @classmethod
    async def get_solo_leaderboard(cls, session: AsyncSession, limit: int) -> list[SoloLeaderboardItem]:
        completed_stmt = (
            select(
                QuestSession.owner_user_id.label("user_id"),
                func.count(QuestSession.id).label("completed_quests"),
                func.avg(
                    func.extract("epoch", QuestSession.completed_at - QuestSession.started_at) / 60.0
                ).label("avg_minutes"),
            )
            .where(
                QuestSession.mode == QuestSessionModeEnum.SOLO,
                QuestSession.status == QuestSessionStatusEnum.COMPLETED,
                QuestSession.owner_user_id.is_not(None),
            )
            .group_by(QuestSession.owner_user_id)
        )
        completed_rows = (await session.execute(completed_stmt)).all()

        rating_stmt = (
            select(
                QuestSession.owner_user_id.label("user_id"),
                func.count(QuestSessionCheckpointAttempt.id).label("rating"),
            )
            .select_from(QuestSessionCheckpointAttempt)
            .join(QuestSession, QuestSession.id == QuestSessionCheckpointAttempt.session_id)
            .where(
                QuestSession.mode == QuestSessionModeEnum.SOLO,
                QuestSession.owner_user_id.is_not(None),
                QuestSessionCheckpointAttempt.is_correct.is_(True),
            )
            .group_by(QuestSession.owner_user_id)
        )
        rating_rows = (await session.execute(rating_stmt)).all()
        rating_map = {row.user_id: int(row.rating or 0) for row in rating_rows}

        user_ids = [row.user_id for row in completed_rows]
        if not user_ids:
            return []
        user_stmt = select(UserModel.id, UserModel.username).where(UserModel.id.in_(user_ids))
        user_rows = (await session.execute(user_stmt)).all()
        user_map = {row.id: row.username for row in user_rows}

        result = [
            SoloLeaderboardItem(
                user_id=row.user_id,
                username=user_map.get(row.user_id, "Unknown"),
                completed_quests=int(row.completed_quests or 0),
                rating=rating_map.get(row.user_id, 0),
                average_time_minutes=int(row.avg_minutes) if row.avg_minutes is not None else None,
            )
            for row in completed_rows
        ]
        result.sort(key=lambda x: (-x.rating, -x.completed_quests, (x.average_time_minutes or 10**9)))
        return result[:limit]

    @classmethod
    async def get_team_leaderboard(cls, session: AsyncSession, limit: int) -> list[TeamLeaderboardItem]:
        completed_stmt = (
            select(
                QuestSession.owner_team_id.label("team_id"),
                func.count(QuestSession.id).label("completed_quests"),
                func.avg(
                    func.extract("epoch", QuestSession.completed_at - QuestSession.started_at) / 60.0
                ).label("avg_minutes"),
            )
            .where(
                QuestSession.mode == QuestSessionModeEnum.TEAM,
                QuestSession.status == QuestSessionStatusEnum.COMPLETED,
                QuestSession.owner_team_id.is_not(None),
            )
            .group_by(QuestSession.owner_team_id)
        )
        completed_rows = (await session.execute(completed_stmt)).all()

        rating_stmt = (
            select(
                QuestSession.owner_team_id.label("team_id"),
                func.count(QuestSessionCheckpointAttempt.id).label("rating"),
            )
            .select_from(QuestSessionCheckpointAttempt)
            .join(QuestSession, QuestSession.id == QuestSessionCheckpointAttempt.session_id)
            .where(
                QuestSession.mode == QuestSessionModeEnum.TEAM,
                QuestSession.owner_team_id.is_not(None),
                QuestSessionCheckpointAttempt.is_correct.is_(True),
            )
            .group_by(QuestSession.owner_team_id)
        )
        rating_rows = (await session.execute(rating_stmt)).all()
        rating_map = {row.team_id: int(row.rating or 0) for row in rating_rows}

        team_ids = [row.team_id for row in completed_rows]
        if not team_ids:
            return []
        team_stmt = select(TeamModel.id, TeamModel.name).where(TeamModel.id.in_(team_ids))
        team_rows = (await session.execute(team_stmt)).all()
        team_map = {row.id: row.name for row in team_rows}

        result = [
            TeamLeaderboardItem(
                team_id=row.team_id,
                team_name=team_map.get(row.team_id, "Unknown"),
                completed_quests=int(row.completed_quests or 0),
                rating=rating_map.get(row.team_id, 0),
                average_time_minutes=int(row.avg_minutes) if row.avg_minutes is not None else None,
            )
            for row in completed_rows
        ]
        result.sort(key=lambda x: (-x.rating, -x.completed_quests, (x.average_time_minutes or 10**9)))
        return result[:limit]


