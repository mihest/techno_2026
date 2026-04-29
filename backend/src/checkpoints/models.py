from __future__ import annotations

from decimal import Decimal
import uuid

from sqlalchemy import ForeignKey, Numeric, SmallInteger, String, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column
from geoalchemy2 import Geography

from src.models import Base


class Checkpoint(Base):
    __tablename__ = "checkpoints"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    quest_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("quests.id", ondelete="CASCADE"),
        nullable=False,
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    task: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    rules: Mapped[str] = mapped_column(Text, nullable=False)

    # In DB they're DECIMAL(11,8). We keep them numeric on ORM level as well.
    lat: Mapped[Decimal] = mapped_column(Numeric(11, 8), nullable=False)
    lng: Mapped[Decimal] = mapped_column(Numeric(11, 8), nullable=False)

