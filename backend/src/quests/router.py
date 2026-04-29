import uuid
from typing import Literal

from fastapi import APIRouter, Query

from src.database import SessionDep
from src.quests.schemas import QuestListFilters, QuestListResponse, QuestDetailResponse
from src.quests.service import QuestService

router = APIRouter()


@router.get("", response_model=QuestListResponse, tags=["Quests"], summary="Получение списка опубликованных квестов")
async def get_quests(
    session: SessionDep,
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


@router.get("/{quest_id}", response_model=QuestDetailResponse, tags=["Quests"], summary="Получение квеста по id с чекпоинтами")
async def get_quest(
    session: SessionDep,
    quest_id: uuid.UUID,
):
    return await QuestService.get_quest(session, quest_id)
