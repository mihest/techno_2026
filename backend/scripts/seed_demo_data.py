import asyncio
import random
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parents[1]))

from geoalchemy2.elements import WKTElement
from sqlalchemy import select, func

from src.accounts.models import UserModel, UserRoleEnum, AgeGroupModel
from src.auth.utils import get_password_hash
from src.checkpoints.models import Checkpoint, CheckpointQuestionTypeEnum, CheckpointAnswer, CheckpointHint
from src.database import db
from src.quest_sessions.models import QuestSession, QuestSessionModeEnum, QuestSessionStatusEnum, QuestSessionCheckpointAttempt
from src.quests.models import Quest, QuestStatusEnum
from src.teams.models import TeamModel, TeamMemberModel


DEMO_PASSWORD = "demo12345"
CITY = "Москва"
DISTRICT = "Арбат"
CITY_DISTRICT = f"{CITY}, {DISTRICT}"


async def get_or_create_age_group(session) -> uuid.UUID:
    existing = await session.execute(select(AgeGroupModel).limit(1))
    age_group = existing.scalars().first()
    if age_group:
        return age_group.id

    age_group = AgeGroupModel(
        id=uuid.uuid4(),
        name="14-15",
    )
    session.add(age_group)
    await session.flush()
    return age_group.id


async def create_users(session, age_group_id: uuid.UUID) -> tuple[list[UserModel], UserModel]:
    users: list[UserModel] = []

    for i in range(1, 11):
        username = f"demo_user_{i:02d}"
        nickname = f"ДемоИгрок{i:02d}"
        existing = await session.execute(select(UserModel).where(UserModel.username == username))
        user = existing.scalars().first()
        if user:
            users.append(user)
            continue

        user = UserModel(
            id=uuid.uuid4(),
            username=username,
            nickname=nickname,
            hashed_password=get_password_hash(DEMO_PASSWORD),
            age_group_id=age_group_id,
            role=UserRoleEnum.USER,
            is_deleted=False,
        )
        session.add(user)
        users.append(user)

    moderator_username = "demo_moderator"
    existing_mod = await session.execute(select(UserModel).where(UserModel.username == moderator_username))
    moderator = existing_mod.scalars().first()
    if not moderator:
        moderator = UserModel(
            id=uuid.uuid4(),
            username=moderator_username,
            nickname="DemoModerator",
            hashed_password=get_password_hash(DEMO_PASSWORD),
            age_group_id=age_group_id,
            role=UserRoleEnum.MODERATOR,
            is_deleted=False,
        )
        session.add(moderator)

    await session.flush()
    return users, moderator


async def create_teams(session, users: list[UserModel]) -> list[TeamModel]:
    target_teams_count = 4
    existing = await session.execute(select(TeamModel).where(TeamModel.name.like("Demo Team %")))
    teams = existing.scalars().all()

    while len(teams) < target_teams_count:
        team_index = len(teams) + 1
        owner = users[team_index - 1]
        team = TeamModel(
            id=uuid.uuid4(),
            owner_id=owner.id,
            name=f"Demo Team {team_index}",
            description=f"Демо команда #{team_index}",
            join_code=uuid.uuid4().hex[:8],
        )
        session.add(team)
        await session.flush()
        session.add(
            TeamMemberModel(
                id=uuid.uuid4(),
                user_id=owner.id,
                team_id=team.id,
            )
        )
        teams.append(team)

    await session.flush()

    user_ids_with_team = set(
        (
            await session.execute(select(TeamMemberModel.user_id))
        ).scalars().all()
    )
    free_users = [u for u in users if u.id not in user_ids_with_team]
    for user in free_users:
        team = random.choice(teams)
        session.add(
            TeamMemberModel(
                id=uuid.uuid4(),
                user_id=user.id,
                team_id=team.id,
            )
        )

    await session.flush()
    return teams


def build_checkpoint_payload(order: int, quest_id: uuid.UUID, lat: float, lng: float):
    question_type = random.choice([CheckpointQuestionTypeEnum.CODE, CheckpointQuestionTypeEnum.CHOICE])
    checkpoint = Checkpoint(
        quest_id=quest_id,
        order=order,
        title=f"Точка {order}",
        task=f"Задание для точки {order}. Найдите ответ рядом с координатами.",
        question_type=question_type,
        address=f"ул. Арбат, {10 + order}",
        point_rules="Соблюдайте ПДД и не мешайте прохожим.",
        lat=lat,
        lng=lng,
        point=WKTElement(f"POINT({lng} {lat})", srid=4326),
    )
    hints = [
        f"Подсказка {order}.1",
        f"Подсказка {order}.2",
        f"Подсказка {order}.3",
    ]
    return checkpoint, hints, question_type


async def create_quests_with_checkpoints(session, users: list[UserModel]) -> list[Quest]:
    existing = await session.execute(select(Quest).where(Quest.title.like("Demo Quest %")))
    quests = existing.scalars().all()
    target_count = 15

    while len(quests) < target_count:
        idx = len(quests) + 1
        author = random.choice(users)
        base_lat = 55.75 + random.uniform(-0.02, 0.02)
        base_lng = 37.58 + random.uniform(-0.02, 0.02)

        quest = Quest(
            id=uuid.uuid4(),
            author_id=author.id,
            title=f"Demo Quest {idx:02d}",
            description=f"Демо-квест №{idx} по району {DISTRICT}. Подходит для тестов API и фронтенда.",
            city_district=CITY_DISTRICT,
            category=random.choice(["История", "Искусство", "Еда", "Урбанистика"]),
            cover_file=None,
            difficulty=random.randint(1, 5),
            duration_minutes=random.choice([45, 60, 75, 90, 120]),
            rules_warning="Следите за безопасностью.",
            status=QuestStatusEnum.PUBLISHED,
            start_lat=base_lat,
            start_lng=base_lng,
            start_point=WKTElement(f"POINT({base_lng} {base_lat})", srid=4326),
            route_geometry={
                "type": "LineString",
                "coordinates": [
                    [base_lng, base_lat],
                    [base_lng + 0.003, base_lat + 0.002],
                    [base_lng + 0.006, base_lat + 0.003],
                ],
            },
            client_extra={
                "city": CITY,
                "district": DISTRICT,
                "categories": ["История"],
            },
            published_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 60)),
        )
        session.add(quest)
        await session.flush()

        checkpoints_count = random.randint(3, 7)
        for order in range(1, checkpoints_count + 1):
            cp_lat = base_lat + order * 0.001
            cp_lng = base_lng + order * 0.0012
            checkpoint, hints, question_type = build_checkpoint_payload(order, quest.id, cp_lat, cp_lng)
            session.add(checkpoint)
            await session.flush()

            for i, hint_text in enumerate(hints, start=1):
                session.add(
                    CheckpointHint(
                        checkpoint_id=checkpoint.id,
                        hint_order=i,
                        text=hint_text,
                    )
                )

            if question_type == CheckpointQuestionTypeEnum.CODE:
                session.add(
                    CheckpointAnswer(
                        checkpoint_id=checkpoint.id,
                        option_order=None,
                        answer_text=f"code{order}",
                        is_correct=True,
                    )
                )
            else:
                correct_index = random.randint(1, 4)
                for option_order in range(1, 5):
                    session.add(
                        CheckpointAnswer(
                            checkpoint_id=checkpoint.id,
                            option_order=option_order,
                            answer_text=f"Вариант {option_order}",
                            is_correct=option_order == correct_index,
                        )
                    )

        quests.append(quest)

    await session.flush()
    return quests


async def create_demo_sessions(session, users: list[UserModel], teams: list[TeamModel], quests: list[Quest]) -> None:
    existing_count_stmt = select(func.count()).select_from(QuestSession).where(QuestSession.id.is_not(None))
    existing_count = (await session.execute(existing_count_stmt)).scalar_one()
    if existing_count >= 20:
        return

    for _ in range(20):
        quest = random.choice(quests)
        is_team = random.choice([True, False])
        mode = QuestSessionModeEnum.TEAM if is_team else QuestSessionModeEnum.SOLO
        owner_user = None if is_team else random.choice(users)
        owner_team = random.choice(teams) if is_team else None

        total_checkpoints_stmt = select(func.count()).select_from(Checkpoint).where(Checkpoint.quest_id == quest.id)
        total_checkpoints = (await session.execute(total_checkpoints_stmt)).scalar_one()
        if total_checkpoints == 0:
            continue

        started_at = datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30), minutes=random.randint(30, 200))
        completed_at = started_at + timedelta(minutes=random.randint(25, 180))

        session_obj = QuestSession(
            id=uuid.uuid4(),
            quest_id=quest.id,
            mode=mode,
            status=QuestSessionStatusEnum.COMPLETED,
            owner_user_id=owner_user.id if owner_user else None,
            owner_team_id=owner_team.id if owner_team else None,
            current_checkpoint_order=total_checkpoints,
            total_checkpoints=total_checkpoints,
            started_at=started_at,
            completed_at=completed_at,
        )
        session.add(session_obj)
        await session.flush()

        checkpoints_stmt = (
            select(Checkpoint)
            .where(Checkpoint.quest_id == quest.id)
            .order_by(Checkpoint.order.asc())
        )
        checkpoints = (await session.execute(checkpoints_stmt)).scalars().all()
        for checkpoint in checkpoints:
            session.add(
                QuestSessionCheckpointAttempt(
                    session_id=session_obj.id,
                    checkpoint_id=checkpoint.id,
                    attempt_text="demo",
                    selected_answer_id=None,
                    is_correct=True,
                )
            )


async def main():
    random.seed(42)
    async with db.session() as session:
        age_group_id = await get_or_create_age_group(session)
        users, moderator = await create_users(session, age_group_id)
        teams = await create_teams(session, users)
        quests = await create_quests_with_checkpoints(session, users + [moderator])
        await create_demo_sessions(session, users, teams, quests)
        await session.commit()

    print("Demo data seeded successfully.")
    print(f"Users: 10 (+1 moderator), Teams: {len(teams)}, Quests: {len(quests)}")
    print(f"City for quests: {CITY_DISTRICT}")


if __name__ == "__main__":
    asyncio.run(main())
