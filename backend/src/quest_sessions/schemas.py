import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

from src.quest_sessions.models import QuestSessionModeEnum, QuestSessionStatusEnum


class QuestSessionStartRequest(BaseModel):
    mode: Literal["solo", "team"]


class SessionCheckpointAnswerOption(BaseModel):
    id: int
    option_order: int | None
    answer_text: str


class SessionCheckpointView(BaseModel):
    id: int
    order: int
    title: str
    task: str
    question_type: Literal["code", "choice"]
    address: str | None
    point_rules: str
    lat: float
    lng: float
    hints: list[str]
    answers: list[SessionCheckpointAnswerOption]


class QuestSessionResponse(BaseModel):
    id: uuid.UUID
    quest_id: uuid.UUID
    mode: QuestSessionModeEnum
    status: QuestSessionStatusEnum
    current_checkpoint_order: int
    total_checkpoints: int
    started_at: datetime
    completed_at: datetime | None = None
    passed_checkpoints: list[SessionCheckpointView] = Field(default_factory=list)
    checkpoint: SessionCheckpointView | None = None


class QuestSessionAnswerRequest(BaseModel):
    answer_text: str | None = None
    selected_answer_id: int | None = None


class QuestSessionAnswerResponse(BaseModel):
    is_correct: bool
    status: QuestSessionStatusEnum
    message: str
    current_checkpoint_order: int
    passed_checkpoints: list[SessionCheckpointView] = Field(default_factory=list)
    checkpoint: SessionCheckpointView | None = None
