from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.session import Base, engine
from app.routers import auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    from sqlalchemy.orm import Session
    from app.crud.user import seed_admin_user
    with Session(engine) as db:
        seed_admin_user(db)
    yield


app = FastAPI(
    title="Voltaire Catalog API",
    description="API de gestion de catalogue produits — Groupe Voltaire",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router, prefix="/auth", tags=["auth"])


@app.get("/health")
def health_check():
    return {"status": "ok"}
