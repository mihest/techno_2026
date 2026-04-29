from sqlalchemy import select
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

