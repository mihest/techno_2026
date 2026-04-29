import uuid
from enum import Enum

from sqlalchemy import (
    String,
    Text,
    Integer,
    SmallInteger,
    DateTime,
    ForeignKey,
    CheckConstraint,
    Index,
    func,
    Enum as SQLAlchemyEnum
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from geoalchemy2 import Geography

from src.models import Base


class QuestStatusEnum(Enum):
    DRAFT = "Черновик"
    MODERATION = "На модерации"
    PUBLISHED = "Опубликовано"
    ARCHIVE = "Архив"
    HIDDEN = "Скрыто"

    def __str__(self):
        return self.value


class Quest(Base):
    __tablename__ = "quests"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    author_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    city_district: Mapped[str] = mapped_column(String(120), nullable=False)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    age_group_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("age_groups.id"),
        nullable=True,
    )

    cover_file: Mapped[str] = mapped_column(String, nullable=True)

    difficulty: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    rules_warning: Mapped[str | None] = mapped_column(Text, nullable=True)

    status: Mapped[QuestStatusEnum] = mapped_column(
        SQLAlchemyEnum(QuestStatusEnum),
        nullable=False
    )
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    start_lat: Mapped[float | None] = mapped_column(nullable=True)
    start_lng: Mapped[float | None] = mapped_column(nullable=True)

    start_point = mapped_column(
        Geography(geometry_type="POINT", srid=4326),
        nullable=True,
    )

    published_at = mapped_column(DateTime(timezone=True), nullable=True)
    archived_at = mapped_column(DateTime(timezone=True), nullable=True)

    created_at = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    __table_args__ = (
        CheckConstraint("char_length(title) >= 5", name="check_quest_title_min_len"),
        CheckConstraint("char_length(description) >= 30", name="check_quest_description_min_len"),
        CheckConstraint("difficulty >= 1 AND difficulty <= 5", name="check_quest_difficulty_range"),
        CheckConstraint("duration_minutes > 0", name="check_quest_duration_positive"),
        Index("ix_quests_author_id", "author_id"),
        Index("ix_quests_status", "status"),
        Index("ix_quests_city_district", "city_district"),
        Index("ix_quests_category", "category"),
        Index("ix_quests_age_group_id", "age_group_id"),
        Index("ix_quests_difficulty", "difficulty"),
        Index("ix_quests_duration_minutes", "duration_minutes"),
        Index("ix_quests_created_at", "created_at"),
        Index("ix_quests_start_point", "start_point", postgresql_using="gist"),
    )