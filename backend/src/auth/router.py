from fastapi import APIRouter, Depends, Request, HTTPException, Response, Cookie
from pydantic import ValidationError

from src.accounts.models import UserModel
from src.accounts.schemas import UserResponse, UserCreate
from src.auth.config import jwt_settings
from src.auth.dependencies import validate_token, get_current_user
from src.auth.schemas import AuthResponse, Credentials, Refresh
from src.auth.service import AuthService
from src.database import SessionDep
from src.exceptions import ErrorResponseModel

router = APIRouter()


@router.post("/SignUp", responses={
    409: {
        'description': 'Conflict unique attribute',
        'model': ErrorResponseModel,
        'content': {
            'application/json': {
                 'example': {
                     'detail': 'Username is already taken.'
                 }
            }
        }
    }
}, status_code=201)
async def sign_up(
        data: UserCreate,
        session: SessionDep
) -> AuthResponse:
    return await AuthService.sign_up(data, session)


@router.post("/SignIn", openapi_extra={
    'requestBody': {
        'content': {
            'application/json': {
                'schema': Credentials.model_json_schema()
            },
            'application/x-www-form-urlencoded': {
                'schema': Credentials.model_json_schema()
            }
        },
        'required': True
    },
    'responses': {
        401: {'description': 'Invalid credentials', 'content': {
            'application/json': {'schema': ErrorResponseModel.model_json_schema(),
                                 'example': {'detail': 'Invalid username or password.'}}}}
    }
}, summary="Авторизация")
async def sign_in(
        request: Request,
        response: Response,
        session: SessionDep
) -> AuthResponse:
    try:
        content_type = request.headers.get("Content-Type")
        if content_type == "application/json":
            credentials = await request.json()
            credentials_model = Credentials(**credentials)
        elif content_type == "application/x-www-form-urlencoded":
            form = await request.form()
            credentials_model = Credentials(username=form.get("username", ""), password=form.get("password", ""))
        else:
            raise HTTPException(status_code=415, detail="Unsupported media type")
        tokens = await AuthService.sign_in(credentials_model.username, credentials_model.password.get_secret_value(), session)

        response.set_cookie(
            key="refresh_token",
            value=str(tokens.refresh_token),
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=60 * 60 * 24 * jwt_settings.refresh_token_expire_days,
            path="/"
        )

        return tokens
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=[{"loc": err["loc"], "msg": err["msg"]} for err in e.errors()])


@router.put("/SignOut", summary="Выход из аккаунта")
async def sign_out(
        session: SessionDep,
        token: str = Depends(validate_token)
):
    return await AuthService.sign_out(access_token=token, session=session)


@router.get("/Validate", summary="Проверка на валидность access токена")
async def validate(
        user: UserModel = Depends(get_current_user)
):
    return {
        "status": "success",
        "user": UserResponse(
                id=user.id,
                username=user.username,
                is_deleted=user.is_deleted,
                role=user.role,
            )
    }


@router.post("/Refresh", summary="Получение новых токенов")
async def refresh(
        response: Response,
        session: SessionDep,
        refresh_token: str = Cookie(None)
) -> AuthResponse:
    token = await AuthService.refresh_tokens(token=refresh_token, session=session)

    response.set_cookie(
        key="refresh_token",
        value=token.refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 60 * 24 * jwt_settings.refresh_token_expire_days,
        path="/"
    )

    return token
