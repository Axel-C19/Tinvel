from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..deps import get_db

router = APIRouter(prefix="/places", tags=["places"])


@router.post("/", response_model=schemas.PlaceOut)
def create_place(place: schemas.PlaceCreate, db: Session = Depends(get_db)):
    db_place = models.Place(**place.dict())
    db.add(db_place)
    db.commit()
    db.refresh(db_place)
    return db_place

@router.get("/", response_model=List[schemas.PlaceOut])
def list_places(city: str | None = None, country: str | None = None, db: Session = Depends(get_db)):
    query = db.query(models.Place).filter(models.Place.is_active.is_(True))
    if city:
        query = query.filter(models.Place.city == city)
    if country:
        query = query.filter(models.Place.country == country)
    return query.all()

@router.get("/available-locations")
def get_available_locations(db: Session = Depends(get_db)):
    rows = db.query(models.Place.city, models.Place.country).distinct().all()
    return [{"city": c, "country": p} for c, p in rows]

@router.get("/by-city/{city}", response_model=List[schemas.PlaceOut])
def get_places_by_city(city: str, db: Session = Depends(get_db)):
    return db.query(models.Place).filter(models.Place.city.ilike(city)).all()

@router.get("/{place_id}", response_model=schemas.PlaceOut)
def get_place(place_id: int, db: Session = Depends(get_db)):
    place = db.query(models.Place).filter(models.Place.id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    return place