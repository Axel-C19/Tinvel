from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..deps import get_db

router = APIRouter(prefix="/swipes", tags=["swipes"])


@router.post("/", response_model=schemas.SwipeOut)
def create_swipe(swipe: schemas.SwipeCreate, db: Session = Depends(get_db)):
    db_swipe = models.Swipe(**swipe.dict())
    db.add(db_swipe)
    db.commit()
    db.refresh(db_swipe)
    return db_swipe


@router.get("/liked/{user_id}", response_model=List[schemas.PlaceOut])
def list_liked_places(user_id: str, db: Session = Depends(get_db)):
    swipes = (
        db.query(models.Swipe)
        .filter(models.Swipe.user_id == user_id, models.Swipe.liked.is_(True))
        .all()
    )
    place_ids = [s.place_id for s in swipes]
    if not place_ids:
        return []
    places = db.query(models.Place).filter(models.Place.id.in_(place_ids)).all()
    return places

@router.post("/", response_model=schemas.SwipeOut)
def create_swipe(swipe: schemas.SwipeCreate, db: Session = Depends(get_db)):
    db_swipe = models.Swipe(**swipe.dict())
    db.add(db_swipe)
    db.commit()
    db.refresh(db_swipe)
    return db_swipe
