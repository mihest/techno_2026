from typing import Optional

from sqlalchemy import select, func, cast
from sqlalchemy.ext.asyncio import AsyncSession
from geoalchemy2 import Geography

from src.quests.models import Quest, QuestStatusEnum
from src.quests.schemas import QuestListFilters


class QuestDAO:
    @classmethod
    async def list_with_total(cls, session: AsyncSession, filters: QuestListFilters) -> tuple[list[Quest], int]:
        where_clauses = [Quest.status == QuestStatusEnum.PUBLISHED]
        distance_expr = None

        if filters.category:
            where_clauses.append(Quest.category == filters.category)
        if filters.city_district:
            where_clauses.append(Quest.city_district == filters.city_district)
        if filters.age_group_id:
            where_clauses.append(Quest.age_group_id == filters.age_group_id)
        if filters.difficulty:
            where_clauses.append(Quest.difficulty == filters.difficulty)

        if filters.duration_bucket == "up_to_30":
            where_clauses.append(Quest.duration_minutes <= 30)
        elif filters.duration_bucket == "up_to_60":
            where_clauses.append(Quest.duration_minutes <= 60)
        elif filters.duration_bucket == "up_to_120":
            where_clauses.append(Quest.duration_minutes <= 120)
        elif filters.duration_bucket == "over_120":
            where_clauses.append(Quest.duration_minutes > 120)

        if filters.latitude is not None and filters.longitude is not None and filters.radius_meters is not None:
            target_point = cast(
                func.ST_SetSRID(func.ST_MakePoint(filters.longitude, filters.latitude), 4326),
                Geography,
            )
            distance_expr = func.ST_Distance(Quest.start_point, target_point)
            where_clauses.append(Quest.start_point.is_not(None))
            where_clauses.append(func.ST_DWithin(Quest.start_point, target_point, filters.radius_meters))

        order_by_map = {
            "created_at": Quest.created_at,
            "published_at": Quest.published_at,
            "difficulty": Quest.difficulty,
            "duration_minutes": Quest.duration_minutes,
            "distance": distance_expr if distance_expr is not None else Quest.created_at,
        }
        order_column = order_by_map[filters.sort_by]
        order_clause = order_column.asc() if filters.sort_order == "asc" else order_column.desc()

        stmt = (
            select(Quest)
            .where(*where_clauses)
            .order_by(order_clause)
            .offset(filters.offset)
            .limit(filters.limit)
        )
        count_stmt = select(func.count()).select_from(Quest).where(*where_clauses)

        result = await session.execute(stmt)
        total_result = await session.execute(count_stmt)

        return result.scalars().all(), total_result.scalar_one()

    @classmethod
    async def get_published_by_id(cls, session: AsyncSession, quest_id) -> Optional[Quest]:
        stmt = select(Quest).where(Quest.id == quest_id, Quest.status == QuestStatusEnum.PUBLISHED)
        result = await session.execute(stmt)
        return result.scalars().one_or_none()
