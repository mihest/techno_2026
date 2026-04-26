from dotenv import load_dotenv
from pathlib import Path
from src.config import BaseDir

from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()


class JWTSettings(BaseSettings):
    private_key_path: Path = BaseDir / "certificates" / "private_key.pem"
    public_key_path: Path = BaseDir / "certificates" / "public_key.pem"
    algorithm: str = "RS256"
    access_token_expire_minutes: int
    refresh_token_expire_days: int

    model_config = SettingsConfigDict(env_file='.env', extra='ignore', env_prefix='JWT_')


jwt_settings = JWTSettings()
