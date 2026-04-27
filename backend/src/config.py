from pathlib import Path

from dotenv import load_dotenv

from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()

BaseDir = Path(__file__).parent.parent


class Settings(BaseSettings):
    postgres_host: str
    postgres_port: str
    postgres_user: str
    postgres_password: str
    postgres_db: str

    @property
    def postgres_url(self) -> str:
        return (f"postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}"
                f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}")

    # log_folder_path: Path = BaseDir / "logs"
    # log_info_file_name: str

    # @property
    # def log_info_file_path(self) -> Path:
    #     return self.log_folder_path / self.log_info_file_name

    db_echo: bool = False

    model_config = SettingsConfigDict(env_file='.env', extra='ignore')


settings = Settings()

