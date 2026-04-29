from __future__ import annotations

from decimal import Decimal
import uuid

from pydantic import BaseModel


class CheckpointResponse(BaseModel):
    id: int
    quest_id: uuid.UUID
    name: str
    task: str
    type: int
    rules: str
    lat: float
    lng: float


class QuestCheckpointItem(BaseModel):
    id: int
    name: str
    task: str
    type: int
    rules: str
    lat: float
    lng: float

