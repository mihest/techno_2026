from enum import Enum
import uuid
from datetime import datetime

from sqlalchemy import UUID, String, Boolean, Enum as SQLAlchemyEnum, func, TIMESTAMP, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models import Base


class UserRoleEnum(Enum):
    ADMIN = "Админ"
    MODERATOR = "Модератор"
    USER = "Пользователь"

    def __str__(self):
        return self.value


class AgeGroupModel(Base):
    __tablename__ = 'age_groups'
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)


class UserModel(Base):
    __tablename__ = 'users'
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    nickname: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(
        String(1024), nullable=False
    )
    age_group_id: Mapped[uuid.UUID] = mapped_column(UUID, ForeignKey(
        "age_groups.id"
    ))

    role: Mapped[UserRoleEnum] = mapped_column(
        SQLAlchemyEnum(UserRoleEnum),
        nullable=False
    )

    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())

    refresh_sessions: Mapped[list["RefreshSessionModel"]] = relationship(
        "RefreshSessionModel",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    owner_teams: Mapped[list["TeamModel"]] = relationship(
        "TeamModel",
        back_populates="owner",
        cascade="all, delete-orphan",
        passive_deletes=True
    )
    age_group: Mapped["AgeGroupModel"] = relationship("AgeGroupModel", backref="users")
    member_teams: Mapped[list["TeamMemberModel"]] = relationship("TeamMemberModel", back_populates="user")
