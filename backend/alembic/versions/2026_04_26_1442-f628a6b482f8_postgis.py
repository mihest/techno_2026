"""postgis

Revision ID: f628a6b482f8
Revises: 2683ed3b0711
Create Date: 2026-04-27 14:42:34.330976

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f628a6b482f8'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DROP EXTENSION IF EXISTS postgis")
