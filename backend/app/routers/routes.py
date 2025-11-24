from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..deps import get_db
import requests

router = APIRouter(prefix="/routes", tags=["routes"])

AZURE_MAPS_KEY = "TU_LLAVE_DE_AZURE_MAPS"

@router.get("/generate/{trip_id}")
def generate_route(trip_id: int, db: Session = Depends(get_db)):

    swipes = (
        db.query(models.Swipe)
        .filter(models.Swipe.trip_id == trip_id, models.Swipe.liked == True)
        .all()
    )

    place_ids = [s.place_id for s in swipes]

    places = db.query(models.Place).filter(models.Place.id.in_(place_ids)).all()

    if len(places) < 2:
        raise HTTPException(400, "Necesitas al menos 2 lugares para generar una ruta")

    coords = [f"{p.lon},{p.lat}" for p in places]

    waypoints = "&".join([f"wp.{i}={coords[i]}" for i in range(len(coords))])

    url = (
        f"https://atlas.microsoft.com/route/directions/json?api-version=1.0"
        f"&subscription-key={AZURE_MAPS_KEY}&{waypoints}"
    )

    res = requests.get(url)

    return res.json()


@router.get("/trip/{trip_id}/places")
def get_trip_places(trip_id: int, db: Session = Depends(get_db)):
    liked_swipes = (
        db.query(models.Swipe)
        .filter(models.Swipe.trip_id == trip_id, models.Swipe.liked == True)
        .all()
    )

    place_ids = [s.place_id for s in liked_swipes]

    places = (
        db.query(models.Place)
        .filter(models.Place.id.in_(place_ids))
        .all()
    )

    return [
        {
            "id": p.id,
            "name": p.name,
            "lat": p.latitude,
            "lon": p.longitude
        }
        for p in places
    ]

@router.get("/user/{user_id}", response_model=schemas.RouteResponse)
def calculate_route_for_user(user_id: str, db: Session = Depends(get_db)):
    swipes = (
        db.query(models.Swipe)
        .filter(models.Swipe.user_id == user_id, models.Swipe.liked.is_(True))
        .all()
    )
    place_ids = [s.place_id for s in swipes]
    places = db.query(models.Place).filter(models.Place.id.in_(place_ids)).all()

    ordered_points = [
        schemas.RoutePoint(place_id=p.id, latitude=p.latitude, longitude=p.longitude)
        for p in places
    ]

    return schemas.RouteResponse(
        ordered_points=ordered_points,
        estimated_total_time_minutes=0.0
    )
