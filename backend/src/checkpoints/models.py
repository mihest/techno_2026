import uuid
from enum import Enum

from sqlalchemy import ForeignKey, Numeric, SmallInteger, String, Text, Integer, Enum as SQLAlchemyEnum, Boolean, Index
from sqlalchemy.orm import Mapped, mapped_column
from geoalchemy2 import Geography

from src.models import Base


class CheckpointQuestionTypeEnum(Enum):
    CODE = "code"
    CHOICE = "choice"


class Checkpoint(Base):
    __tablename__ = "checkpoints"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    quest_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("quests.id", ondelete="CASCADE"),
        nullable=False,
    )

    order: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    task: Mapped[str] = mapped_column(Text, nullable=False)
    question_type: Mapped[CheckpointQuestionTypeEnum] = mapped_column(
        SQLAlchemyEnum(CheckpointQuestionTypeEnum),
        nullable=False
    )
    address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    point_rules: Mapped[str] = mapped_column(Text, nullable=False)

    lat: Mapped[float] = mapped_column(Numeric(11, 8), nullable=False)
    lng: Mapped[float] = mapped_column(Numeric(11, 8), nullable=False)

    point = mapped_column(
        Geography(geometry_type="POINT", srid=4326),
        nullable=True,
    )

    __table_args__ = (
        Index("ix_checkpoints_quest_id_order", "quest_id", "order", unique=True),
    )


class CheckpointAnswer(Base):
    __tablename__ = "checkpoint_answers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    checkpoint_id: Mapped[int] = mapped_column(
        ForeignKey("checkpoints.id", ondelete="CASCADE"),
        nullable=False,
    )
    option_order: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    answer_text: Mapped[str] = mapped_column(Text, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    __table_args__ = (
        Index("ix_checkpoint_answers_checkpoint_id", "checkpoint_id"),
    )


class CheckpointHint(Base):
    __tablename__ = "checkpoint_hints"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    checkpoint_id: Mapped[int] = mapped_column(
        ForeignKey("checkpoints.id", ondelete="CASCADE"),
        nullable=False,
    )
    hint_order: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)

    __table_args__ = (
        Index("ix_checkpoint_hints_checkpoint_id", "checkpoint_id"),
        Index("ix_checkpoint_hints_checkpoint_id_order", "checkpoint_id", "hint_order", unique=True),
    )

