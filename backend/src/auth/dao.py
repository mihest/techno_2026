from src.dao import BaseDAO
from src.auth.models import RefreshSessionModel
from src.auth.schemas import RefreshSessionCreate, RefreshSessionUpdate


class RefreshSessionDAO(BaseDAO[RefreshSessionModel, RefreshSessionCreate, RefreshSessionUpdate]):
    model = RefreshSessionModel
