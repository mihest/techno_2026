"""add quest sessions

Revision ID: 2b7c9d4e5f6a
Revises: 9f8e7d6c5b4a
Create Date: 2026-04-29 06:40:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "2b7c9d4e5f6a"
down_revision: Union[str, Sequence[str], None] = "9f8e7d6c5b4a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'questsessionmodeenum') THEN
                CREATE TYPE questsessionmodeenum AS ENUM ('SOLO', 'TEAM');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'questsessionstatusenum') THEN
                CREATE TYPE questsessionstatusenum AS ENUM ('ACTIVE', 'COMPLETED', 'FAILED');
            END IF;
        END $$;
        """
    )

    mode_enum = postgresql.ENUM("SOLO", "TEAM", name="questsessionmodeenum", create_type=False)
    status_enum = postgresql.ENUM("ACTIVE", "COMPLETED", "FAILED", name="questsessionstatusenum", create_type=False)

    op.create_table(
        "quest_sessions",
        sa.Column("id", sa.UUID(), primary_key=True, nullable=False),
        sa.Column("quest_id", sa.UUID(), sa.ForeignKey("quests.id", ondelete="CASCADE"), nullable=False),
        sa.Column("mode", mode_enum, nullable=False),
        sa.Column("status", status_enum, nullable=False),
        sa.Column("owner_user_id", sa.UUID(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("owner_team_id", sa.UUID(), sa.ForeignKey("teams.id", ondelete="SET NULL"), nullable=True),
        sa.Column("current_checkpoint_order", sa.Integer(), nullable=False),
        sa.Column("total_checkpoints", sa.Integer(), nullable=False),
        sa.Column("started_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("completed_at", sa.TIMESTAMP(timezone=True), nullable=True),
    )
    op.execute(
        "CREATE UNIQUE INDEX uq_active_quest_user_session ON quest_sessions (quest_id, owner_user_id) "
        "WHERE status = 'ACTIVE'"
    )
    op.execute(
        "CREATE UNIQUE INDEX uq_active_quest_team_session ON quest_sessions (quest_id, owner_team_id) "
        "WHERE status = 'ACTIVE'"
    )
    op.create_index("ix_quest_sessions_owner_user_id", "quest_sessions", ["owner_user_id"], unique=False)
    op.create_index("ix_quest_sessions_owner_team_id", "quest_sessions", ["owner_team_id"], unique=False)
    op.create_index("ix_quest_sessions_quest_id_status", "quest_sessions", ["quest_id", "status"], unique=False)

    op.create_table(
        "quest_session_checkpoint_attempts",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column("session_id", sa.UUID(), sa.ForeignKey("quest_sessions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("checkpoint_id", sa.Integer(), sa.ForeignKey("checkpoints.id", ondelete="CASCADE"), nullable=False),
        sa.Column("attempt_text", sa.Text(), nullable=True),
        sa.Column("selected_answer_id", sa.Integer(), sa.ForeignKey("checkpoint_answers.id", ondelete="SET NULL"), nullable=True),
        sa.Column("is_correct", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index(
        "ix_qs_attempts_session_checkpoint",
        "quest_session_checkpoint_attempts",
        ["session_id", "checkpoint_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_qs_attempts_session_checkpoint", table_name="quest_session_checkpoint_attempts")
    op.drop_table("quest_session_checkpoint_attempts")

    op.drop_index("ix_quest_sessions_quest_id_status", table_name="quest_sessions")
    op.drop_index("ix_quest_sessions_owner_team_id", table_name="quest_sessions")
    op.drop_index("ix_quest_sessions_owner_user_id", table_name="quest_sessions")
    op.execute("DROP INDEX IF EXISTS uq_active_quest_team_session")
    op.execute("DROP INDEX IF EXISTS uq_active_quest_user_session")
    op.drop_table("quest_sessions")

    op.execute("DROP TYPE IF EXISTS questsessionstatusenum")
    op.execute("DROP TYPE IF EXISTS questsessionmodeenum")
