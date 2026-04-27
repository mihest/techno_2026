from typing import Optional

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
import jwt

from src.auth.config import jwt_settings
from src.database import SessionDep
from src.auth.exceptions import InvalidToken, TokenExpiredException
from src.accounts.models import UserModel, UserRoleEnum
from src.accounts.service import UserService

oauth2 = OAuth2PasswordBearer(tokenUrl='/api/auth/SignIn')


async def validate_token(token: str = Depends(oauth2)):
    try:
        decode = jwt.decode(
            token,
            jwt_settings.public_key_path.read_text(),
            algorithms=[jwt_settings.algorithm]
        )
        if decode.get('is_deleted') is True:
            raise InvalidToken
        return token
    except jwt.ExpiredSignatureError:
        raise TokenExpiredException
    except jwt.PyJWTError:
        raise InvalidToken


async def get_current_user(session: SessionDep, token: str = Depends(oauth2)) -> Optional[any]:
    try:
        payload = jwt.decode(
            token,
            jwt_settings.public_key_path.read_text(),
            algorithms=[jwt_settings.algorithm]
        )
        user_id = payload.get("sub")
        if user_id is None or payload.get('is_deleted') is True:
            raise InvalidToken
        current_user: UserModel = await UserService.get_user(user_id, session)
        return current_user
    except jwt.ExpiredSignatureError:
        raise TokenExpiredException
    except (jwt.PyJWTError, HTTPException):
        raise InvalidToken


async def get_current_admin(current_user: UserModel = Depends(get_current_user)):
    if current_user.role is not UserRoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough privileges.")
    return current_user