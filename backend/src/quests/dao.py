from typing import Optional

from datetime import datetime, timezone

from sqlalchemy import select, func, cast
from sqlalchemy.ext.asyncio import AsyncSession
from geoalchemy2 import Geography
from geoalchemy2.elements import WKTElement

from src.quests.models import Quest, QuestStatusEnum
from src.quests.schemas import QuestListFilters, QuestCreate


class QuestDAO:
    @classmethod
    async def create(cls, session: AsyncSession, author_id, data: QuestCreate) -> Quest:
        category = data.category
        if not category and data.client_extra:
            categories = data.client_extra.get("categories") or []
            if categories:
                category = str(categories[0])

        point_wkt = None
        if data.start_point and data.start_point.type == "Point":
            lng, lat = data.start_point.coordinates
            point_wkt = WKTElement(f"POINT({lng} {lat})", srid=4326)

        quest = Quest(
            author_id=author_id,
            title=data.title,
            description=data.description,
            city_district=data.city_district,
            category=category,
            age_group_id=data.age_group_id,
            cover_file=data.cover_file,
            difficulty=data.difficulty,
            duration_minutes=data.duration_minutes,
            rules_warning=data.rules_warning,
            status=QuestStatusEnum.MODERATION,
            start_lat=data.start_lat,
            start_lng=data.start_lng,
            start_point=point_wkt,
            route_geometry=data.route_geometry.model_dump() if data.route_geometry else None,
            client_extra=data.client_extra,
        )
        session.add(quest)
        await session.flush()
        return quest

    @classmethod
    async def list_for_moderation(cls, session: AsyncSession, offset: int, limit: int) -> tuple[list[Quest], int]:
        where_clause = Quest.status == QuestStatusEnum.MODERATION
        stmt = (
            select(Quest)
            .where(where_clause)
            .order_by(Quest.created_at.asc())
            .offset(offset)
            .limit(limit)
        )
        count_stmt = select(func.count()).select_from(Quest).where(where_clause)
        result = await session.execute(stmt)
        total_result = await session.execute(count_stmt)
        return result.scalars().all(), total_result.scalar_one()

    @classmethod
    async def set_moderation_publish(cls, session: AsyncSession, quest: Quest) -> Quest:
        quest.status = QuestStatusEnum.PUBLISHED
        quest.published_at = datetime.now(timezone.utc)
        quest.rejection_reason = None
        await session.flush()
        return quest

    @classmethod
    async def set_moderation_reject(cls, session: AsyncSession, quest: Quest, reason: str) -> Quest:
        quest.status = QuestStatusEnum.HIDDEN
        quest.rejection_reason = reason
        await session.flush()
        return quest

    @classmethod
    async def list_with_total(cls, session: AsyncSession, filters: QuestListFilters) -> tuple[list[Quest], int]:
        where_clauses = []
        distance_expr = None

        if filters.status is not None:
            where_clauses.append(Quest.status == filters.status)

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
    async def get_by_id(cls, session: AsyncSession, quest_id) -> Optional[Quest]:
        stmt = select(Quest).where(Quest.id == quest_id)
        result = await session.execute(stmt)
        return result.scalars().one_or_none()
