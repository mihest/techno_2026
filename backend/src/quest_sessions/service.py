from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.accounts.models import UserModel
from src.checkpoints.dao import CheckpointDAO
from src.checkpoints.models import CheckpointQuestionTypeEnum
from src.quest_sessions.dao import QuestSessionDAO
from src.quest_sessions.models import QuestSessionModeEnum, QuestSessionStatusEnum
from src.quest_sessions.schemas import (
    QuestSessionStartRequest,
    QuestSessionResponse,
    QuestSessionAnswerRequest,
    QuestSessionAnswerResponse,
    SessionCheckpointView,
    SessionCheckpointAnswerOption,
)
from src.quests.dao import QuestDAO


class QuestSessionService:
    @classmethod
    async def _build_checkpoint_view(cls, session: AsyncSession, quest_id, checkpoint_order: int) -> SessionCheckpointView | None:
        checkpoint = await CheckpointDAO.get_by_quest_and_order(session, quest_id, checkpoint_order)
        if checkpoint is None:
            return None

        hints = await CheckpointDAO.list_hints_by_checkpoint_ids(session, [checkpoint.id])
        answers = await CheckpointDAO.list_answers_by_checkpoint_ids(session, [checkpoint.id])

        answer_options = []
        if checkpoint.question_type == CheckpointQuestionTypeEnum.CHOICE:
            answer_options = [
                SessionCheckpointAnswerOption(
                    id=a.id,
                    option_order=a.option_order,
                    answer_text=a.answer_text,
                )
                for a in answers
            ]

        return SessionCheckpointView(
            id=checkpoint.id,
            order=checkpoint.order,
            title=checkpoint.title,
            task=checkpoint.task,
            question_type=checkpoint.question_type.value,
            address=checkpoint.address,
            point_rules=checkpoint.point_rules,
            lat=float(checkpoint.lat),
            lng=float(checkpoint.lng),
            hints=[h.text for h in hints],
            answers=answer_options,
        )

    @classmethod
    async def _build_passed_checkpoints(cls, session: AsyncSession, session_obj) -> list[SessionCheckpointView]:
        if session_obj.status == QuestSessionStatusEnum.COMPLETED:
            last_passed_order = session_obj.total_checkpoints
        else:
            last_passed_order = max(session_obj.current_checkpoint_order - 1, 0)

        passed_checkpoints: list[SessionCheckpointView] = []
        for checkpoint_order in range(1, last_passed_order + 1):
            checkpoint = await cls._build_checkpoint_view(session, session_obj.quest_id, checkpoint_order)
            if checkpoint is not None:
                passed_checkpoints.append(checkpoint)
        return passed_checkpoints

    @classmethod
    async def start_session(
        cls,
        session: AsyncSession,
        user: UserModel,
        quest_id,
        data: QuestSessionStartRequest,
    ) -> QuestSessionResponse:
        quest = await QuestDAO.get_by_id(session, quest_id)
        if not quest:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quest not found")

        total_checkpoints = await CheckpointDAO.count_by_quest_id(session, quest_id)
        if total_checkpoints == 0:
            raise HTTPException(status_code=400, detail="Quest has no checkpoints")

        user_team_id = await QuestSessionDAO.get_user_team_id(session, user.id)
        if data.mode == "team" and not user_team_id:
            raise HTTPException(status_code=400, detail="User is not in a team")

        owner_user_id = user.id if data.mode == "solo" else None
        owner_team_id = user_team_id if data.mode == "team" else None
        mode_enum = QuestSessionModeEnum.SOLO if data.mode == "solo" else QuestSessionModeEnum.TEAM

        existing_active = await QuestSessionDAO.get_active_for_user_or_team(
            session,
            quest_id=quest_id,
            user_id=user.id,
            team_id=user_team_id if data.mode == "team" else None,
        )
        if existing_active:
            checkpoint = await cls._build_checkpoint_view(
                session,
                existing_active.quest_id,
                existing_active.current_checkpoint_order,
            )
            passed_checkpoints = await cls._build_passed_checkpoints(session, existing_active)
            return QuestSessionResponse(
                id=existing_active.id,
                quest_id=existing_active.quest_id,
                mode=existing_active.mode,
                status=existing_active.status,
                current_checkpoint_order=existing_active.current_checkpoint_order,
                total_checkpoints=existing_active.total_checkpoints,
                started_at=existing_active.started_at,
                completed_at=existing_active.completed_at,
                passed_checkpoints=passed_checkpoints,
                checkpoint=checkpoint,
            )

        session_obj = await QuestSessionDAO.create(
            session,
            quest_id=quest_id,
            mode=mode_enum,
            owner_user_id=owner_user_id,
            owner_team_id=owner_team_id,
            total_checkpoints=total_checkpoints,
        )
        checkpoint = await cls._build_checkpoint_view(session, quest_id, 1)
        passed_checkpoints = await cls._build_passed_checkpoints(session, session_obj)

        return QuestSessionResponse(
            id=session_obj.id,
            quest_id=session_obj.quest_id,
            mode=session_obj.mode,
            status=session_obj.status,
            current_checkpoint_order=session_obj.current_checkpoint_order,
            total_checkpoints=session_obj.total_checkpoints,
            started_at=session_obj.started_at,
            completed_at=session_obj.completed_at,
            passed_checkpoints=passed_checkpoints,
            checkpoint=checkpoint,
        )

    @classmethod
    async def get_current_checkpoint(cls, session: AsyncSession, user: UserModel, session_id) -> QuestSessionResponse:
        session_obj = await QuestSessionDAO.get_by_id(session, session_id)
        if not session_obj:
            raise HTTPException(status_code=404, detail="Session not found")

        user_team_id = await QuestSessionDAO.get_user_team_id(session, user.id)
        if session_obj.mode == QuestSessionModeEnum.SOLO and session_obj.owner_user_id != user.id:
            raise HTTPException(status_code=403, detail="No access to this session")
        if session_obj.mode == QuestSessionModeEnum.TEAM and session_obj.owner_team_id != user_team_id:
            raise HTTPException(status_code=403, detail="No access to this session")

        checkpoint = None
        if session_obj.status == QuestSessionStatusEnum.ACTIVE:
            checkpoint = await cls._build_checkpoint_view(
                session,
                session_obj.quest_id,
                session_obj.current_checkpoint_order,
            )
        passed_checkpoints = await cls._build_passed_checkpoints(session, session_obj)

        return QuestSessionResponse(
            id=session_obj.id,
            quest_id=session_obj.quest_id,
            mode=session_obj.mode,
            status=session_obj.status,
            current_checkpoint_order=session_obj.current_checkpoint_order,
            total_checkpoints=session_obj.total_checkpoints,
            started_at=session_obj.started_at,
            completed_at=session_obj.completed_at,
            passed_checkpoints=passed_checkpoints,
            checkpoint=checkpoint,
        )

    @classmethod
    async def submit_answer(
        cls,
        session: AsyncSession,
        user: UserModel,
        session_id,
        data: QuestSessionAnswerRequest,
    ) -> QuestSessionAnswerResponse:
        session_obj = await QuestSessionDAO.get_by_id(session, session_id)
        if not session_obj:
            raise HTTPException(status_code=404, detail="Session not found")
        if session_obj.status != QuestSessionStatusEnum.ACTIVE:
            raise HTTPException(status_code=400, detail="Session is not active")

        user_team_id = await QuestSessionDAO.get_user_team_id(session, user.id)
        if session_obj.mode == QuestSessionModeEnum.SOLO and session_obj.owner_user_id != user.id:
            raise HTTPException(status_code=403, detail="No access to this session")
        if session_obj.mode == QuestSessionModeEnum.TEAM and session_obj.owner_team_id != user_team_id:
            raise HTTPException(status_code=403, detail="No access to this session")

        checkpoint = await CheckpointDAO.get_by_quest_and_order(
            session,
            session_obj.quest_id,
            session_obj.current_checkpoint_order,
        )
        if checkpoint is None:
            raise HTTPException(status_code=400, detail="Current checkpoint not found")

        is_correct = False
        selected_answer_id = data.selected_answer_id

        if checkpoint.question_type == CheckpointQuestionTypeEnum.CODE:
            if not data.answer_text:
                raise HTTPException(status_code=422, detail="answer_text is required for code checkpoint")
            correct_answers = await CheckpointDAO.get_correct_answers(session, checkpoint.id)
            normalized_input = data.answer_text.strip().lower()
            is_correct = any(normalized_input == a.answer_text.strip().lower() for a in correct_answers)
        else:
            if data.selected_answer_id is None:
                raise HTTPException(status_code=422, detail="selected_answer_id is required for choice checkpoint")
            selected = await CheckpointDAO.get_answer_by_id(session, data.selected_answer_id)
            if not selected or selected.checkpoint_id != checkpoint.id:
                raise HTTPException(status_code=400, detail="Selected answer does not belong to current checkpoint")
            is_correct = selected.is_correct

        await QuestSessionDAO.add_attempt(
            session,
            session_id=session_obj.id,
            checkpoint_id=checkpoint.id,
            attempt_text=data.answer_text,
            selected_answer_id=selected_answer_id,
            is_correct=is_correct,
        )

        if not is_correct:
            checkpoint_view = await cls._build_checkpoint_view(session, session_obj.quest_id, session_obj.current_checkpoint_order)
            passed_checkpoints = await cls._build_passed_checkpoints(session, session_obj)
            return QuestSessionAnswerResponse(
                is_correct=False,
                status=session_obj.status,
                message="Wrong answer. Try again.",
                current_checkpoint_order=session_obj.current_checkpoint_order,
                passed_checkpoints=passed_checkpoints,
                checkpoint=checkpoint_view,
            )

        if session_obj.current_checkpoint_order >= session_obj.total_checkpoints:
            session_obj.status = QuestSessionStatusEnum.COMPLETED
            session_obj.completed_at = datetime.now(timezone.utc)
            passed_checkpoints = await cls._build_passed_checkpoints(session, session_obj)
            return QuestSessionAnswerResponse(
                is_correct=True,
                status=session_obj.status,
                message="Quest completed!",
                current_checkpoint_order=session_obj.current_checkpoint_order,
                passed_checkpoints=passed_checkpoints,
                checkpoint=None,
            )

        session_obj.current_checkpoint_order += 1
        checkpoint_view = await cls._build_checkpoint_view(session, session_obj.quest_id, session_obj.current_checkpoint_order)
        passed_checkpoints = await cls._build_passed_checkpoints(session, session_obj)
        return QuestSessionAnswerResponse(
            is_correct=True,
            status=session_obj.status,
            message="Correct! Next checkpoint unlocked.",
            current_checkpoint_order=session_obj.current_checkpoint_order,
            passed_checkpoints=passed_checkpoints,
            checkpoint=checkpoint_view,
        )
