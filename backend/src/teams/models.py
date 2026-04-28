import uuid
from datetime import datetime

from src.models import Base

from sqlalchemy import UUID, String, Boolean, Enum as SQLAlchemyEnum, func, TIMESTAMP, ForeignKey, Float, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship


class TeamMemberModel(Base):
    __tablename__ = 'team_members'
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey(
        "users.id", ondelete="CASCADE"
    ))
    team_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey(
        "teams.id", ondelete="CASCADE"
    ))

    user: Mapped["UserModel"] = relationship("UserModel", back_populates="member_teams")
    team: Mapped["TeamModel"] = relationship("TeamModel", back_populates="team_members")
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", name="uq_user_team"),
    )


class TeamModel(Base):
    __tablename__ = 'teams'
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    owner_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey(
        "users.id", ondelete="CASCADE"
    ))
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    description: Mapped[str] = mapped_column(String(100), nullable=False)
    join_code: Mapped[str] = mapped_column(String(12), nullable=False, unique=True)
    # rating: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    owner: Mapped["UserModel"] = relationship("UserModel", back_populates="owner_teams")
    team_members: Mapped["TeamMemberModel"] = relationship("TeamMemberModel", back_populates="team")


