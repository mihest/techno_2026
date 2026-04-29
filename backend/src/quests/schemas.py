import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

from src.quests.models import QuestStatusEnum
from src.checkpoints.schemas import QuestCheckpointItem


class QuestListFilters(BaseModel):
    category: str | None = None
    city_district: str | None = None
    age_group_id: uuid.UUID | None = None
    difficulty: int | None = Field(default=None, ge=1, le=5)
    duration_bucket: Literal["up_to_30", "up_to_60", "up_to_120", "over_120"] | None = None
    latitude: float | None = None
    longitude: float | None = None
    radius_meters: int | None = Field(default=None, gt=0)
    sort_by: Literal["created_at", "published_at", "difficulty", "duration_minutes", "distance"] = "created_at"
    sort_order: Literal["asc", "desc"] = "desc"
    offset: int = Field(default=0, ge=0)
    limit: int = Field(default=20, ge=1, le=100)


class QuestListItem(BaseModel):
    id: uuid.UUID
    author_id: uuid.UUID
    title: str
    description: str
    city_district: str
    category: str | None
    age_group_id: uuid.UUID | None
    cover_file: str | None
    difficulty: int
    duration_minutes: int
    status: QuestStatusEnum
    start_lat: float | None
    start_lng: float | None
    published_at: datetime | None
    created_at: datetime


class QuestListResponse(BaseModel):
    total: int
    items: list[QuestListItem]


class QuestDetailResponse(BaseModel):
    id: uuid.UUID
    author_id: uuid.UUID
    title: str
    description: str
    city_district: str
    category: str | None
    age_group_id: uuid.UUID | None
    cover_file: str | None
    difficulty: int
    duration_minutes: int
    rules_warning: str | None
    status: QuestStatusEnum
    rejection_reason: str | None
    start_lat: float | None
    start_lng: float | None
    published_at: datetime | None
    created_at: datetime
    checkpoints: list[QuestCheckpointItem]
