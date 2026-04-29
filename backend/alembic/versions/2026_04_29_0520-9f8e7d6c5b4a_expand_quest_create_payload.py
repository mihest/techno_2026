"""expand quest create payload

Revision ID: 9f8e7d6c5b4a
Revises: 1a2b3c4d5e6f
Create Date: 2026-04-29 05:20:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import geoalchemy2


# revision identifiers, used by Alembic.
revision: str = "9f8e7d6c5b4a"
down_revision: Union[str, Sequence[str], None] = "1a2b3c4d5e6f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("quests", sa.Column("route_geometry", sa.JSON(), nullable=True))
    op.add_column("quests", sa.Column("client_extra", sa.JSON(), nullable=True))

    # Recreate checkpoints with the new shape used by quest creation API.
    op.drop_index("ix_checkpoints_quest_id", table_name="checkpoints")
    op.drop_table("checkpoints")

    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'checkpointquestiontypeenum') THEN
                CREATE TYPE checkpointquestiontypeenum AS ENUM ('CODE', 'CHOICE');
            END IF;
        END $$;
        """
    )
    checkpoint_question_type = postgresql.ENUM("CODE", "CHOICE", name="checkpointquestiontypeenum", create_type=False)

    op.create_table(
        "checkpoints",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column("quest_id", sa.UUID(), nullable=False),
        sa.Column("order", sa.SmallInteger(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("task", sa.Text(), nullable=False),
        sa.Column("question_type", checkpoint_question_type, nullable=False),
        sa.Column("address", sa.String(length=255), nullable=True),
        sa.Column("point_rules", sa.Text(), nullable=False),
        sa.Column("lat", sa.Numeric(11, 8), nullable=False),
        sa.Column("lng", sa.Numeric(11, 8), nullable=False),
        sa.Column(
            "point",
            geoalchemy2.types.Geography(
                geometry_type="POINT",
                srid=4326,
                dimension=2,
                from_text="ST_GeogFromText",
                name="geography",
            ),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(["quest_id"], ["quests.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_checkpoints_quest_id_order", "checkpoints", ["quest_id", "order"], unique=True)

    op.create_table(
        "checkpoint_answers",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column("checkpoint_id", sa.Integer(), nullable=False),
        sa.Column("option_order", sa.SmallInteger(), nullable=True),
        sa.Column("answer_text", sa.Text(), nullable=False),
        sa.Column("is_correct", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.ForeignKeyConstraint(["checkpoint_id"], ["checkpoints.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_checkpoint_answers_checkpoint_id", "checkpoint_answers", ["checkpoint_id"], unique=False)

    op.create_table(
        "checkpoint_hints",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column("checkpoint_id", sa.Integer(), nullable=False),
        sa.Column("hint_order", sa.SmallInteger(), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(["checkpoint_id"], ["checkpoints.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_checkpoint_hints_checkpoint_id", "checkpoint_hints", ["checkpoint_id"], unique=False)
    op.create_index("ix_checkpoint_hints_checkpoint_id_order", "checkpoint_hints", ["checkpoint_id", "hint_order"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_checkpoint_hints_checkpoint_id_order", table_name="checkpoint_hints")
    op.drop_index("ix_checkpoint_hints_checkpoint_id", table_name="checkpoint_hints")
    op.drop_table("checkpoint_hints")

    op.drop_index("ix_checkpoint_answers_checkpoint_id", table_name="checkpoint_answers")
    op.drop_table("checkpoint_answers")

    op.drop_index("ix_checkpoints_quest_id_order", table_name="checkpoints")
    op.drop_table("checkpoints")

    checkpoint_question_type = sa.Enum("CODE", "CHOICE", name="checkpointquestiontypeenum")
    checkpoint_question_type.drop(op.get_bind(), checkfirst=True)

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

    op.drop_column("quests", "client_extra")
    op.drop_column("quests", "route_geometry")

