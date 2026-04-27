from typing import AsyncGenerator, Annotated
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from src.config import settings
from fastapi import Depends


class DatabaseHelper:
    def __init__(self, url: str, echo: bool = False):
        self.engine = create_async_engine(
            url=url,
            echo=echo
        )
        self.session = async_sessionmaker(
            autocommit=False,
            autoflush=False,
            expire_on_commit=False,
            bind=self.engine
        )

    async def get_async_session(self) -> AsyncGenerator[AsyncSession, None]:
        async with self.session() as session:
            yield session
            await session.commit()


db = DatabaseHelper(
    url=settings.postgres_url,
    echo=settings.db_echo
)


SessionDep = Annotated[AsyncSession, Depends(db.get_async_session)]
