import uuid

from fastapi import APIRouter, Depends, Query

from sqlalchemy.ext.asyncio import AsyncSession

from src.accounts.models import UserModel
from src.accounts.schemas import UserUpdate, UserResponse, UserCreateAdmin, UserCreate, UserUpdateAdmin, UserMeResponse
from src.accounts.service import UserService
from src.auth.dependencies import get_current_user, get_current_admin
from src.database import SessionDep
from src.quests.schemas import QuestListResponse

router = APIRouter()


@router.get("/Me", response_model=UserMeResponse, tags=["Accounts - Users"], summary="Информация о своем аккаунте")
async def get_user_info(
        session: SessionDep,
        user: UserModel = Depends(get_current_user)
):
    return await UserService.get_me(user=user, session=session)


@router.patch("/Update", response_model=UserResponse, tags=["Accounts - Users"], summary="Обновление своего аккаунта")
async def update_user_info(
        data: UserUpdate,
        session: SessionDep,
        user: UserModel = Depends(get_current_user),
):
    return await UserService.update_user(user.id, data, session)


@router.get("/Me/CreatedQuests", response_model=QuestListResponse, tags=["Accounts - Users"], summary="Список созданных квестов")
async def get_my_created_quests(
        session: SessionDep,
        offset: int = Query(0, ge=0, alias="from"),
        limit: int = Query(20, ge=1, le=100, alias="count"),
        user: UserModel = Depends(get_current_user),
):
    items, total = await UserService.get_created_quests(user=user, session=session, offset=offset, limit=limit)
    return QuestListResponse(total=total, items=items)


@router.get("/Me/CompletedQuests", response_model=QuestListResponse, tags=["Accounts - Users"], summary="Список пройденных квестов")
async def get_my_completed_quests(
        session: SessionDep,
        offset: int = Query(0, ge=0, alias="from"),
        limit: int = Query(20, ge=1, le=100, alias="count"),
        user: UserModel = Depends(get_current_user),
):
    items, total = await UserService.get_completed_quests(user=user, session=session, offset=offset, limit=limit)
    return QuestListResponse(total=total, items=items)


@router.get("", response_model=list[UserResponse], tags=["Accounts - Admin"], summary="Получение списка пользователей (кроме админов)")
# @cache(expire=30)
async def get_list_users_info(
        session: SessionDep,
        offset: int = Query(0, ge=0, alias="from"),
        limit: int = Query(100, ge=1, alias="count"),
        admin: UserModel = Depends(get_current_admin)
):
    return await UserService.get_list_users(offset=offset, limit=limit, session=session)


@router.post("", status_code=201, response_model=UserResponse, tags=["Accounts - Admin"], summary="Создание пользователя")
async def create_user(
        data: UserCreateAdmin,
        session: SessionDep,
        admin: UserModel = Depends(get_current_admin),
):
    return await UserService.create_user(data, session)


@router.get("/{user_id}", response_model=UserResponse, tags=["Accounts - Admin"], summary="Информация о пользователе по id (админ)")
# @cache(expire=30)
async def get_user_info(
        user_id: uuid.UUID,
        session: SessionDep,
        admin: UserModel = Depends(get_current_admin)
):
    return await UserService.get_user(user_id, session)


@router.patch("/{user_id}", response_model=UserResponse, tags=["Accounts - Admin"], summary="Обновление информации о пользователе по id (админ)")
async def update_user_by_id(
        user_id: uuid.UUID,
        data: UserUpdateAdmin,
        session: SessionDep,
        admin: UserModel = Depends(get_current_admin),
):
    return await UserService.update_user(user_id, data, session)


@router.delete("/{user_id}", tags=["Accounts - Admin"], summary="Удаление аккаунта пользователя по id")
async def delete_user_by_id(
        user_id: uuid.UUID,
        session: SessionDep,
        admin: UserModel = Depends(get_current_admin),
):
    await UserService.delete_user(user_id, session)


