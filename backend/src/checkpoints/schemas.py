import uuid
from typing import Literal

from pydantic import BaseModel, Field


class CheckpointAnswerCreate(BaseModel):
    option_order: int = Field(..., ge=1, le=4)
    answer_text: str = Field(..., min_length=1)
    is_correct: bool = False


class CheckpointCreate(BaseModel):
    order: int = Field(..., ge=1)
    title: str = Field(..., min_length=1)
    task: str = Field(..., min_length=1)
    question_type: Literal["code", "choice"]
    address: str | None = None
    lat: float
    lng: float
    point: dict | None = None
    hints: list[str] = Field(default_factory=list)
    point_rules: str = Field(..., min_length=1)
    correct_code: str | None = None
    answer_options: list[CheckpointAnswerCreate] | None = None


class CheckpointAnswerResponse(BaseModel):
    id: int
    option_order: int | None
    answer_text: str
    is_correct: bool


class CheckpointResponse(BaseModel):
    id: int
    quest_id: uuid.UUID
    order: int
    title: str
    task: str
    question_type: Literal["code", "choice"]
    address: str | None
    point_rules: str
    lat: float
    lng: float
    hints: list[str]
    answers: list[CheckpointAnswerResponse]


class QuestCheckpointItem(BaseModel):
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
    answers: list[CheckpointAnswerResponse]

