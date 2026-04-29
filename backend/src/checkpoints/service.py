from sqlalchemy.ext.asyncio import AsyncSession
from geoalchemy2.elements import WKTElement

from src.checkpoints.dao import CheckpointDAO
from src.checkpoints.models import Checkpoint, CheckpointAnswer, CheckpointHint, CheckpointQuestionTypeEnum
from src.checkpoints.schemas import QuestCheckpointItem, CheckpointCreate, CheckpointAnswerResponse


class CheckpointService:
    @classmethod
    def validate_checkpoint_payload(cls, checkpoint: CheckpointCreate) -> None:
        if checkpoint.question_type == "code":
            if not checkpoint.correct_code:
                raise ValueError("Checkpoint with question_type='code' requires correct_code")
            return

        options = checkpoint.answer_options or []
        if len(options) != 4:
            raise ValueError("Checkpoint with question_type='choice' requires 4 answer options")
        correct_options = [opt for opt in options if opt.is_correct]
        if len(correct_options) != 1:
            raise ValueError("Checkpoint with question_type='choice' requires exactly one correct option")

    @classmethod
    async def create_for_quest(cls, session: AsyncSession, quest_id, checkpoints: list[CheckpointCreate]) -> None:
        for checkpoint in checkpoints:
            cls.validate_checkpoint_payload(checkpoint)

            point_wkt = None
            if checkpoint.point and checkpoint.point.get("type") == "Point":
                coordinates = checkpoint.point.get("coordinates", [])
                if len(coordinates) == 2:
                    lng, lat = coordinates
                    point_wkt = WKTElement(f"POINT({lng} {lat})", srid=4326)

            checkpoint_db = Checkpoint(
                quest_id=quest_id,
                order=checkpoint.order,
                title=checkpoint.title,
                task=checkpoint.task,
                question_type=CheckpointQuestionTypeEnum(checkpoint.question_type),
                address=checkpoint.address,
                point_rules=checkpoint.point_rules,
                lat=checkpoint.lat,
                lng=checkpoint.lng,
                point=point_wkt,
            )
            session.add(checkpoint_db)
            await session.flush()

            for idx, hint in enumerate(checkpoint.hints, start=1):
                session.add(CheckpointHint(checkpoint_id=checkpoint_db.id, hint_order=idx, text=hint))

            if checkpoint.question_type == "code":
                session.add(
                    CheckpointAnswer(
                        checkpoint_id=checkpoint_db.id,
                        option_order=None,
                        answer_text=checkpoint.correct_code or "",
                        is_correct=True,
                    )
                )
            else:
                for option in checkpoint.answer_options or []:
                    session.add(
                        CheckpointAnswer(
                            checkpoint_id=checkpoint_db.id,
                            option_order=option.option_order,
                            answer_text=option.answer_text,
                            is_correct=option.is_correct,
                        )
                    )

    @classmethod
    async def get_by_quest_id(cls, session: AsyncSession, quest_id) -> list[QuestCheckpointItem]:
        checkpoints = await CheckpointDAO.list_by_quest_id(session, quest_id)
        checkpoint_ids = [cp.id for cp in checkpoints]
        hints = await CheckpointDAO.list_hints_by_checkpoint_ids(session, checkpoint_ids)
        answers = await CheckpointDAO.list_answers_by_checkpoint_ids(session, checkpoint_ids)

        hints_map: dict[int, list[str]] = {}
        for hint in hints:
            hints_map.setdefault(hint.checkpoint_id, []).append(hint.text)

        answers_map: dict[int, list[CheckpointAnswerResponse]] = {}
        for answer in answers:
            answers_map.setdefault(answer.checkpoint_id, []).append(
                CheckpointAnswerResponse(
                    id=answer.id,
                    option_order=answer.option_order,
                    answer_text=answer.answer_text,
                    is_correct=answer.is_correct,
                )
            )

        return [
            QuestCheckpointItem(
                id=cp.id,
                order=cp.order,
                title=cp.title,
                task=cp.task,
                question_type=cp.question_type.value,
                address=cp.address,
                point_rules=cp.point_rules,
                lat=float(cp.lat) if cp.lat is not None else 0.0,
                lng=float(cp.lng) if cp.lng is not None else 0.0,
                hints=hints_map.get(cp.id, []),
                answers=answers_map.get(cp.id, []),
            )
            for cp in checkpoints
        ]

