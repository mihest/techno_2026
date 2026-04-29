import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, ConfigDict

from src.quests.models import QuestStatusEnum
from src.checkpoints.schemas import QuestCheckpointItem, CheckpointCreate


class QuestListFilters(BaseModel):
    status: QuestStatusEnum | None = None
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

class GeoPoint(BaseModel):
    type: Literal["Point"]
    coordinates: list[float] = Field(..., min_length=2, max_length=2)


class GeoLineString(BaseModel):
    type: Literal["LineString"]
    coordinates: list[list[float]] = Field(default_factory=list)


class QuestCreate(BaseModel):
    title: str = Field(..., min_length=5)
    description: str = Field(..., min_length=30)
    city_district: str = Field(..., min_length=2)
    cover_file: str | None = None
    difficulty: int = Field(..., ge=1, le=5)
    duration_minutes: int = Field(..., gt=0)
    rules_warning: str | None = None
    status: QuestStatusEnum = QuestStatusEnum.MODERATION
    start_lat: float | None = None
    start_lng: float | None = None
    start_point: GeoPoint | None = None
    route_geometry: GeoLineString | None = None
    client_extra: dict | None = None
    category: str | None = None
    age_group_id: uuid.UUID | None = None
    checkpoints: list[CheckpointCreate] = Field(default_factory=list)


class QuestListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

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
    route_geometry: dict | None = None
    client_extra: dict | None = None
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
    route_geometry: dict | None = None
    client_extra: dict | None = None
    published_at: datetime | None
    created_at: datetime
    checkpoints: list[QuestCheckpointItem]
