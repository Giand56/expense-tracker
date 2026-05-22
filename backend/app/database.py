from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.models.expense import Base

DATABASE_URL = "sqlite:///./expenses.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_tables() -> None:
    # Import all models so Base knows about them before create_all
    import app.models.user  # noqa: F401
    import app.models.subscription  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _migrate_add_user_id()


def _migrate_add_user_id() -> None:
    """Add user_id column to pre-existing tables that predate auth."""
    with engine.connect() as conn:
        for table in ("expenses", "subscriptions"):
            try:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN user_id INTEGER REFERENCES users(id)"))
                conn.commit()
            except Exception:
                pass  # column already exists


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
