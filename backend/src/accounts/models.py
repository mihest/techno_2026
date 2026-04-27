from enum import Enum
import uuid

from sqlalchemy import UUID, String, Boolean, Enum as SQLAlchemyEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models import Base


class UserRoleEnum(Enum):
    ADMIN = "Админ"
    USER = "Пользователь"

    def __str__(self):
        return self.value


class UserModel(Base):
    __tablename__ = 'users'
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(
        String(1024), nullable=False
    )

    role: Mapped[UserRoleEnum] = mapped_column(
        SQLAlchemyEnum(UserRoleEnum),
        nullable=False
    )

    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)

    refresh_sessions: Mapped[list["RefreshSessionModel"]] = relationship(
        "RefreshSessionModel",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True
    )