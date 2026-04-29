from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.checkpoints.models import Checkpoint, CheckpointAnswer, CheckpointHint


class CheckpointDAO:
    @classmethod
    async def list_by_quest_id(cls, session: AsyncSession, quest_id) -> list[Checkpoint]:
        stmt = (
            select(Checkpoint)
            .where(Checkpoint.quest_id == quest_id)
            .order_by(Checkpoint.id.asc())
        )
        result = await session.execute(stmt)
        return result.scalars().all()

    @classmethod
    async def list_answers_by_checkpoint_ids(cls, session: AsyncSession, checkpoint_ids: list[int]) -> list[CheckpointAnswer]:
        if not checkpoint_ids:
            return []
        stmt = (
            select(CheckpointAnswer)
            .where(CheckpointAnswer.checkpoint_id.in_(checkpoint_ids))
            .order_by(CheckpointAnswer.option_order.asc().nulls_last(), CheckpointAnswer.id.asc())
        )
        result = await session.execute(stmt)
        return result.scalars().all()

    @classmethod
    async def list_hints_by_checkpoint_ids(cls, session: AsyncSession, checkpoint_ids: list[int]) -> list[CheckpointHint]:
        if not checkpoint_ids:
            return []
        stmt = (
            select(CheckpointHint)
            .where(CheckpointHint.checkpoint_id.in_(checkpoint_ids))
            .order_by(CheckpointHint.hint_order.asc(), CheckpointHint.id.asc())
        )
        result = await session.execute(stmt)
        return result.scalars().all()

    @classmethod
    async def get_by_quest_and_order(cls, session: AsyncSession, quest_id, checkpoint_order: int) -> Checkpoint | None:
        stmt = select(Checkpoint).where(Checkpoint.quest_id == quest_id, Checkpoint.order == checkpoint_order)
        result = await session.execute(stmt)
        return result.scalars().one_or_none()

    @classmethod
    async def count_by_quest_id(cls, session: AsyncSession, quest_id) -> int:
        stmt = select(func.count()).select_from(Checkpoint).where(Checkpoint.quest_id == quest_id)
        result = await session.execute(stmt)
        return result.scalar_one()

    @classmethod
    async def get_answer_by_id(cls, session: AsyncSession, answer_id: int) -> CheckpointAnswer | None:
        stmt = select(CheckpointAnswer).where(CheckpointAnswer.id == answer_id)
        result = await session.execute(stmt)
        return result.scalars().one_or_none()

    @classmethod
    async def get_correct_answers(cls, session: AsyncSession, checkpoint_id: int) -> list[CheckpointAnswer]:
        stmt = select(CheckpointAnswer).where(
            CheckpointAnswer.checkpoint_id == checkpoint_id,
            CheckpointAnswer.is_correct.is_(True),
        )
        result = await session.execute(stmt)
        return result.scalars().all()

