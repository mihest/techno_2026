import uuid
from datetime import timedelta, datetime, timezone
import jwt

from sqlalchemy.ext.asyncio import AsyncSession

from .dao import RefreshSessionDAO
from .dependencies import validate_token
from .exceptions import InvalidToken, TokenExpiredException, InvalidCredentialsException
from .models import RefreshSessionModel
from .schemas import AuthResponse, RefreshSessionCreate, RefreshSessionUpdate
from .utils import is_valid_password

from .config import jwt_settings
from src.accounts.dao import UserDAO
from src.accounts.models import UserModel
from ..accounts.schemas import UserResponse, UserCreate
from ..accounts.service import UserService


class AuthService:
    @classmethod
    async def sign_up(cls, data: UserCreate, session):
        user = await UserService.create_user(data, session)
        return await cls.create_token(user, session)

    @classmethod
    async def sign_in(cls, username: str, password: str, session: AsyncSession) -> AuthResponse:
        user: UserModel = await UserDAO.find_one_or_none(session, *[UserModel.username == username,
                                                                   UserModel.is_deleted == False])
        if user and is_valid_password(password, user.hashed_password):
            return await cls.create_token(user, session)
        raise InvalidCredentialsException

    @classmethod
    async def sign_out(cls, access_token: str, session: AsyncSession):
        await RefreshSessionDAO.delete(session, RefreshSessionModel.access_token == access_token)

    @classmethod
    async def refresh_tokens(cls, session: AsyncSession, token: uuid.UUID):
        refresh_session: RefreshSessionModel = await RefreshSessionDAO.find_one_or_none(
            session,
            RefreshSessionModel.refresh_token == token
        )
        if refresh_session is None:
            raise InvalidToken
        if datetime.now(timezone.utc) >= refresh_session.expires_at:
            await RefreshSessionDAO.delete(session, RefreshSessionModel.refresh_token == token)
            raise TokenExpiredException
        user = await UserDAO.find_one_or_none(session, UserModel.id == refresh_session.user_id)
        if not user or user.is_deleted:
            raise InvalidToken
        access_token = await cls._create_access_token(user)
        refresh_token = await cls._create_refresh_token()
        refresh_token_expires = datetime.now(timezone.utc) + timedelta(
            days=jwt_settings.refresh_token_expire_days
        )
        await RefreshSessionDAO.update(
            session,
            RefreshSessionModel.refresh_token == refresh_session.refresh_token,
            obj_in=RefreshSessionUpdate(
                refresh_token=uuid.UUID(refresh_token),
                access_token=access_token,
                expires_at=refresh_token_expires
            )
        )
        return AuthResponse(
            user=UserResponse(
                id=user.id,
                username=user.username,
                is_deleted=user.is_deleted,
                role=user.role
            ),
            access_token=access_token,
            refresh_token=uuid.UUID(refresh_token),
            token_type='Bearer'
        )

    @classmethod
    async def create_token(cls, user: UserModel, session: AsyncSession) -> AuthResponse:
        access_token = await cls._create_access_token(user)
        refresh_token_expires = datetime.now(timezone.utc) + timedelta(
            days=jwt_settings.refresh_token_expire_days
        )
        refresh_token = await cls._create_refresh_token()

        await RefreshSessionDAO.add(
            session,
            RefreshSessionCreate(
                user_id=user.id,
                refresh_token=uuid.UUID(refresh_token),
                access_token=access_token,
                expires_at=refresh_token_expires
            )
        )
        return AuthResponse(
            user=UserResponse(
                id=user.id,
                username=user.username,
                is_deleted=user.is_deleted,
                role=user.role
            ),
            access_token=access_token,
            refresh_token=uuid.UUID(refresh_token),
            token_type='Bearer'
        )

    @classmethod
    async def abort_all_sessions(cls, user_id: uuid.UUID, session: AsyncSession, ):
        await RefreshSessionDAO.delete(session, RefreshSessionModel.user_id == user_id)

    @classmethod
    async def _create_access_token(cls, user: UserModel) -> str:
        to_encode = {
            'sub': str(user.id),
            'username': user.username,
            'role': user.role.name,
            'is_deleted': user.is_deleted,
            'exp': datetime.now(timezone.utc) + timedelta(minutes=jwt_settings.access_token_expire_minutes)
        }

        encoded_jwt = jwt.encode(
            to_encode,
            jwt_settings.private_key_path.read_text(),
            algorithm=jwt_settings.algorithm
        )
        return encoded_jwt

    @classmethod
    async def _create_refresh_token(cls) -> str:
        return str(uuid.uuid4())

    @classmethod
    async def check_valid_token(cls, access_token, session: AsyncSession):
        await validate_token(session, access_token)

