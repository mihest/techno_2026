from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.checkpoints.models import Checkpoint


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

