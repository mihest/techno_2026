"""add checkpoints table

Revision ID: 1a2b3c4d5e6f
Revises: 7d0e0ac9b6f1
Create Date: 2026-04-29 05:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "1a2b3c4d5e6f"
down_revision: Union[str, Sequence[str], None] = "7d0e0ac9b6f1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "checkpoints",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column("quest_id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("task", sa.Text(), nullable=False),
        sa.Column("type", sa.SmallInteger(), nullable=False),
        sa.Column("rules", sa.Text(), nullable=False),
        sa.Column("lat", sa.Numeric(11, 8), nullable=False),
        sa.Column("lng", sa.Numeric(11, 8), nullable=False),
        sa.ForeignKeyConstraint(["quest_id"], ["quests.id"], ondelete="CASCADE"),
    )

    op.create_index("ix_checkpoints_quest_id", "checkpoints", ["quest_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_checkpoints_quest_id", table_name="checkpoints")
    op.drop_table("checkpoints")

