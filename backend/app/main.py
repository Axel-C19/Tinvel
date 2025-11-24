from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base
from .routers import places, swipes, routes, auth, trips

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Tinvel API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(places.router)
app.include_router(swipes.router)
app.include_router(routes.router)
app.include_router(trips.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
