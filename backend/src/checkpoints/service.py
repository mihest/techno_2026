from sqlalchemy.ext.asyncio import AsyncSession

from src.checkpoints.dao import CheckpointDAO
from src.checkpoints.schemas import QuestCheckpointItem


class CheckpointService:
    @classmethod
    async def get_by_quest_id(cls, session: AsyncSession, quest_id) -> list[QuestCheckpointItem]:
        checkpoints = await CheckpointDAO.list_by_quest_id(session, quest_id)
        # Convert Decimal -> float to keep JSON response clean.
        return [
            QuestCheckpointItem(
                id=cp.id,
                name=cp.name,
                task=cp.task,
                type=cp.type,
                rules=cp.rules,
                lat=float(cp.lat) if cp.lat is not None else 0.0,
                lng=float(cp.lng) if cp.lng is not None else 0.0,
            )
            for cp in checkpoints
        ]

