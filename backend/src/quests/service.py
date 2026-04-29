from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.checkpoints.service import CheckpointService
from src.quests.dao import QuestDAO
from src.quests.schemas import QuestListFilters, QuestListResponse, QuestDetailResponse, QuestCreate
from src.accounts.models import UserModel


class QuestService:
    @classmethod
    async def create_quest(cls, session: AsyncSession, user: UserModel, data: QuestCreate) -> QuestDetailResponse:
        try:
            quest = await QuestDAO.create(session, user.id, data)
            await CheckpointService.create_for_quest(session, quest.id, data.checkpoints)
            checkpoints = await CheckpointService.get_by_quest_id(session, quest.id)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))

        return QuestDetailResponse(
            id=quest.id,
            author_id=quest.author_id,
            title=quest.title,
            description=quest.description,
            city_district=quest.city_district,
            category=quest.category,
            age_group_id=quest.age_group_id,
            cover_file=quest.cover_file,
            difficulty=quest.difficulty,
            duration_minutes=quest.duration_minutes,
            rules_warning=quest.rules_warning,
            status=quest.status,
            rejection_reason=quest.rejection_reason,
            start_lat=quest.start_lat,
            start_lng=quest.start_lng,
            route_geometry=quest.route_geometry,
            client_extra=quest.client_extra,
            published_at=quest.published_at,
            created_at=quest.created_at,
            checkpoints=checkpoints,
        )

    @classmethod
    async def get_quests(cls, session: AsyncSession, filters: QuestListFilters) -> QuestListResponse:
        items, total = await QuestDAO.list_with_total(session, filters)
        return QuestListResponse(total=total, items=items)

    @classmethod
    async def get_quest(cls, session: AsyncSession, quest_id) -> QuestDetailResponse:
        quest = await QuestDAO.get_by_id(session, quest_id)
        if not quest:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quest not found")

        checkpoints = await CheckpointService.get_by_quest_id(session, quest_id)

        return QuestDetailResponse(
            id=quest.id,
            author_id=quest.author_id,
            title=quest.title,
            description=quest.description,
            city_district=quest.city_district,
            category=quest.category,
            age_group_id=quest.age_group_id,
            cover_file=quest.cover_file,
            difficulty=quest.difficulty,
            duration_minutes=quest.duration_minutes,
            rules_warning=quest.rules_warning,
            status=quest.status,
            rejection_reason=quest.rejection_reason,
            start_lat=quest.start_lat,
            start_lng=quest.start_lng,
            route_geometry=quest.route_geometry,
            client_extra=quest.client_extra,
            published_at=quest.published_at,
            created_at=quest.created_at,
            checkpoints=checkpoints,
        )
