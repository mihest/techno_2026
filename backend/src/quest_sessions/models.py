import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import (
    UUID,
    TIMESTAMP,
    ForeignKey,
    Enum as SQLAlchemyEnum,
    Integer,
    Boolean,
    Text,
    func,
    Index,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from src.models import Base


class QuestSessionModeEnum(Enum):
    SOLO = "solo"
    TEAM = "team"


class QuestSessionStatusEnum(Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    FAILED = "failed"


class QuestSession(Base):
    __tablename__ = "quest_sessions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quest_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey("quests.id", ondelete="CASCADE"), nullable=False)
    mode: Mapped[QuestSessionModeEnum] = mapped_column(SQLAlchemyEnum(QuestSessionModeEnum), nullable=False)
    status: Mapped[QuestSessionStatusEnum] = mapped_column(
        SQLAlchemyEnum(QuestSessionStatusEnum),
        nullable=False,
        default=QuestSessionStatusEnum.ACTIVE,
    )

    owner_user_id: Mapped[uuid.UUID | None] = mapped_column(UUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    owner_team_id: Mapped[uuid.UUID | None] = mapped_column(UUID, ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)

    current_checkpoint_order: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    total_checkpoints: Mapped[int] = mapped_column(Integer, nullable=False)
    started_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)

    __table_args__ = (
        Index(
            "uq_active_quest_user_session",
            "quest_id",
            "owner_user_id",
            unique=True,
            postgresql_where=text("status = 'ACTIVE'"),
        ),
        Index(
            "uq_active_quest_team_session",
            "quest_id",
            "owner_team_id",
            unique=True,
            postgresql_where=text("status = 'ACTIVE'"),
        ),
        Index("ix_quest_sessions_owner_user_id", "owner_user_id"),
        Index("ix_quest_sessions_owner_team_id", "owner_team_id"),
        Index("ix_quest_sessions_quest_id_status", "quest_id", "status"),
    )


class QuestSessionCheckpointAttempt(Base):
    __tablename__ = "quest_session_checkpoint_attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID,
        ForeignKey("quest_sessions.id", ondelete="CASCADE"),
        nullable=False,
    )
    checkpoint_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("checkpoints.id", ondelete="CASCADE"),
        nullable=False,
    )
    attempt_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    selected_answer_id: Mapped[int | None] = mapped_column(
        Integer,
        ForeignKey("checkpoint_answers.id", ondelete="SET NULL"),
        nullable=True,
    )
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        Index("ix_qs_attempts_session_checkpoint", "session_id", "checkpoint_id"),
    )
