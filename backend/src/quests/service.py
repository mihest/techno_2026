import uuid
from pathlib import Path

from fastapi import HTTPException, status
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from src.checkpoints.service import CheckpointService
from src.quests.dao import QuestDAO
from src.quests.schemas import QuestListFilters, QuestListResponse, QuestDetailResponse, QuestCreate
from src.accounts.models import UserModel
from src.config import BaseDir
from src.teams.models import FileModel


class QuestService:
    @classmethod
    async def upload_cover(cls, session: AsyncSession, file: UploadFile) -> str:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only image files are allowed")

        original_suffix = Path(file.filename or "").suffix.lower()
        suffix = original_suffix if original_suffix else ".jpg"
        file_name = f"{uuid.uuid4().hex}{suffix}"

        media_dir = BaseDir / "media" / "quests"
        media_dir.mkdir(parents=True, exist_ok=True)
        absolute_path = media_dir / file_name
        relative_path = f"/media/quests/{file_name}"

        content = await file.read()
        if not content:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty")

        max_size_bytes = 10 * 1024 * 1024
        if len(content) > max_size_bytes:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image is too large (max 10MB)")

        absolute_path.write_bytes(content)
        session.add(FileModel(path=relative_path))
        await session.flush()

        return relative_path

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
