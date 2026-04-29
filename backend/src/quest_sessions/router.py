import uuid

from fastapi import APIRouter, Depends

from src.accounts.models import UserModel
from src.auth.dependencies import get_current_user
from src.database import SessionDep
from src.quest_sessions.schemas import (
    QuestSessionStartRequest,
    QuestSessionResponse,
    QuestSessionAnswerRequest,
    QuestSessionAnswerResponse,
)
from src.quest_sessions.service import QuestSessionService

router = APIRouter()


@router.post("/quests/{quest_id}/start", response_model=QuestSessionResponse, tags=["Quest Sessions"])
async def start_quest_session(
    session: SessionDep,
    quest_id: uuid.UUID,
    data: QuestSessionStartRequest,
    user: UserModel = Depends(get_current_user),
):
    return await QuestSessionService.start_session(session, user, quest_id, data)


@router.get("/sessions/{session_id}", response_model=QuestSessionResponse, tags=["Quest Sessions"])
async def get_quest_session(
    session: SessionDep,
    session_id: uuid.UUID,
    user: UserModel = Depends(get_current_user),
):
    return await QuestSessionService.get_current_checkpoint(session, user, session_id)


@router.post("/sessions/{session_id}/answer", response_model=QuestSessionAnswerResponse, tags=["Quest Sessions"])
async def submit_session_answer(
    session: SessionDep,
    session_id: uuid.UUID,
    data: QuestSessionAnswerRequest,
    user: UserModel = Depends(get_current_user),
):
    return await QuestSessionService.submit_answer(session, user, session_id, data)
