"""add quest category and age group

Revision ID: 7d0e0ac9b6f1
Revises: 494fc53c3ce8
Create Date: 2026-04-29 02:55:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "7d0e0ac9b6f1"
down_revision: Union[str, Sequence[str], None] = "494fc53c3ce8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("quests", sa.Column("category", sa.String(length=100), nullable=True))
    op.add_column("quests", sa.Column("age_group_id", sa.UUID(), nullable=True))
    op.create_foreign_key(
        "fk_quests_age_group_id_age_groups",
        "quests",
        "age_groups",
        ["age_group_id"],
        ["id"],
    )
    op.create_index("ix_quests_category", "quests", ["category"], unique=False)
    op.create_index("ix_quests_age_group_id", "quests", ["age_group_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_quests_age_group_id", table_name="quests")
    op.drop_index("ix_quests_category", table_name="quests")
    op.drop_constraint("fk_quests_age_group_id_age_groups", "quests", type_="foreignkey")
    op.drop_column("quests", "age_group_id")
    op.drop_column("quests", "category")
