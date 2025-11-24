from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..deps import get_db
from .. import models
from pydantic import BaseModel

router = APIRouter(prefix="/trips", tags=["trips"])

class TripCreate(BaseModel):
    user_id: int
    city: str
    country: str

class TripOut(BaseModel):
    id: int
    user_id: int
    city: str
    country: str

    class Config:
        orm_mode = True


@router.post("/", response_model=TripOut)
def create_trip(trip_in: TripCreate, db: Session = Depends(get_db)):
    trip = models.Trip(
        user_id=trip_in.user_id,
        destination_city=trip_in.city,
        destination_country=trip_in.country
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)

    return TripOut(
        id=trip.id,
        user_id=trip.user_id,
        city=trip.destination_city,
        country=trip.destination_country
    )
@router.get("/{trip_id}")
def get_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip