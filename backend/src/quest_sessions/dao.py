from typing import Optional

from sqlalchemy import select, and_, or_, insert
from sqlalchemy.ext.asyncio import AsyncSession

from src.quest_sessions.models import (
    QuestSession,
    QuestSessionStatusEnum,
    QuestSessionCheckpointAttempt,
    QuestSessionModeEnum,
)
from src.teams.models import TeamMemberModel


class QuestSessionDAO:
    @classmethod
    async def get_user_team_id(cls, session: AsyncSession, user_id):
        stmt = select(TeamMemberModel.team_id).where(TeamMemberModel.user_id == user_id)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

    @classmethod
    async def get_active_for_user_or_team(cls, session: AsyncSession, quest_id, user_id, team_id):
        conditions = [QuestSession.quest_id == quest_id, QuestSession.status == QuestSessionStatusEnum.ACTIVE]
        owner_conditions = [QuestSession.owner_user_id == user_id]
        if team_id:
            owner_conditions.append(QuestSession.owner_team_id == team_id)
        stmt = select(QuestSession).where(and_(*conditions), or_(*owner_conditions))
        result = await session.execute(stmt)
        return result.scalars().one_or_none()

    @classmethod
    async def create(cls, session: AsyncSession, *, quest_id, mode: QuestSessionModeEnum, owner_user_id, owner_team_id, total_checkpoints):
        session_obj = QuestSession(
            quest_id=quest_id,
            mode=mode,
            status=QuestSessionStatusEnum.ACTIVE,
            owner_user_id=owner_user_id,
            owner_team_id=owner_team_id,
            current_checkpoint_order=1,
            total_checkpoints=total_checkpoints,
        )
        session.add(session_obj)
        await session.flush()
        return session_obj

    @classmethod
    async def get_by_id(cls, session: AsyncSession, session_id) -> Optional[QuestSession]:
        stmt = select(QuestSession).where(QuestSession.id == session_id)
        result = await session.execute(stmt)
        return result.scalars().one_or_none()

    @classmethod
    async def add_attempt(
        cls,
        session: AsyncSession,
        *,
        session_id,
        checkpoint_id,
        attempt_text: str | None,
        selected_answer_id: int | None,
        is_correct: bool,
    ) -> None:
        stmt = insert(QuestSessionCheckpointAttempt).values(
            session_id=session_id,
            checkpoint_id=checkpoint_id,
            attempt_text=attempt_text,
            selected_answer_id=selected_answer_id,
            is_correct=is_correct,
        )
        await session.execute(stmt)
