from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import create_tables
from app.models.subscription import Subscription  # noqa: F401 — registers table with Base
from app.models.user import User  # noqa: F401 — registers table with Base
from app.routes.auth import router as auth_router
from app.routes.expenses import router as expenses_router
from app.routes.subscriptions import router as subscriptions_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield


app = FastAPI(title="Finance Tracker", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(expenses_router)
app.include_router(subscriptions_router)
