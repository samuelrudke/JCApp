import pytest
from database import Base, engine
# Importa também os teus models para garantir que o SQLAlchemy os conhece
import models  # noqa

@pytest.fixture(autouse=True)
def setup_test_database():
    """Garante que todas as tabelas são criadas antes de cada teste e limpas no final."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)