import uuid
from typing import Literal

from fastapi import APIRouter, Query, Depends, UploadFile, File, Form, HTTPException, status

from src.accounts.models import UserModel
from src.auth.dependencies import get_current_user, get_current_moderator_or_admin
from src.database import SessionDep
from src.quests.schemas import (
    QuestListFilters,
    QuestListResponse,
    QuestDetailResponse,
    QuestCreate,
    QuestCoverUploadResponse,
    QuestModerationDecision,
)
from src.quests.models import QuestStatusEnum
from src.quests.service import QuestService

router = APIRouter()


@router.post(
    "/upload-cover",
    response_model=QuestCoverUploadResponse,
    status_code=201,
    tags=["Quests"],
    summary="Загрузка обложки квеста",
)
async def upload_quest_cover(
    session: SessionDep,
    file: UploadFile = File(...),
    user: UserModel = Depends(get_current_user),
):
    path = await QuestService.upload_cover(session, file)
    return QuestCoverUploadResponse(path=path)


@router.post("", response_model=QuestDetailResponse, status_code=201, tags=["Quests"], summary="Создание квеста")
async def create_quest(
    session: SessionDep,
    payload: str = Form(...),
    cover: UploadFile | None = File(default=None),
    user: UserModel = Depends(get_current_user),
):
    try:
        data = QuestCreate.model_validate_json(payload)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid payload JSON: {exc}",
        )

    if cover is not None:
        cover_path = await QuestService.upload_cover(session, cover)
        data = data.model_copy(update={"cover_file": cover_path})

    return await QuestService.create_quest(session, user, data)


@router.get("", response_model=QuestListResponse, tags=["Quests"], summary="Получение списка опубликованных квестов")
async def get_quests(
    session: SessionDep,
    status: QuestStatusEnum | None = Query(default=None),
    category: str | None = Query(default=None),
    city_district: str | None = Query(default=None),
    age_group_id: uuid.UUID | None = Query(default=None),
    difficulty: int | None = Query(default=None, ge=1, le=5),
    duration_bucket: Literal["up_to_30", "up_to_60", "up_to_120", "over_120"] | None = Query(default=None),
    latitude: float | None = Query(default=None),
    longitude: float | None = Query(default=None),
    radius_meters: int | None = Query(default=None, gt=0),
    sort_by: Literal["created_at", "published_at", "difficulty", "duration_minutes", "distance"] = Query(default="created_at"),
    sort_order: Literal["asc", "desc"] = Query(default="desc"),
    offset: int = Query(default=0, ge=0, alias="from"),
    limit: int = Query(default=20, ge=1, le=100, alias="count"),
):
    filters = QuestListFilters(
        status=status,
        category=category,
        city_district=city_district,
        age_group_id=age_group_id,
        difficulty=difficulty,
        duration_bucket=duration_bucket,
        latitude=latitude,
        longitude=longitude,
        radius_meters=radius_meters,
        sort_by=sort_by,
        sort_order=sort_order,
        offset=offset,
        limit=limit,
    )
    return await QuestService.get_quests(session, filters)


@router.get(
    "/moderation/pending",
    response_model=QuestListResponse,
    tags=["Quests - Moderation"],
    summary="Список квестов на модерации",
)
async def get_pending_quests(
    session: SessionDep,
    offset: int = Query(default=0, ge=0, alias="from"),
    limit: int = Query(default=20, ge=1, le=100, alias="count"),
    moderator: UserModel = Depends(get_current_moderator_or_admin),
):
    return await QuestService.get_quests_for_moderation(session, offset=offset, limit=limit)


@router.post(
    "/{quest_id}/moderation/decision",
    response_model=QuestDetailResponse,
    tags=["Quests - Moderation"],
    summary="Решение модератора по квесту",
)
async def moderate_quest(
    session: SessionDep,
    quest_id: uuid.UUID,
    decision: QuestModerationDecision,
    moderator: UserModel = Depends(get_current_moderator_or_admin),
):
    return await QuestService.moderate_quest(session, quest_id, decision)


@router.get("/{quest_id}", response_model=QuestDetailResponse, tags=["Quests"], summary="Получение квеста по id с чекпоинтами")
async def get_quest(
    session: SessionDep,
    quest_id: uuid.UUID,
):
    return await QuestService.get_quest(session, quest_id)
