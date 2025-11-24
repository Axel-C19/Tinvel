from pydantic import BaseModel
from typing import Optional, List


class PlaceBase(BaseModel):
    name: str
    description: Optional[str] = None
    city: str
    country: str
    latitude: float
    longitude: float
    image_url: Optional[str] = None


class PlaceCreate(PlaceBase):
    pass


class PlaceOut(PlaceBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True


class SwipeBase(BaseModel):
    user_id: str
    place_id: int
    liked: bool


class SwipeCreate(SwipeBase):
    user_id: int
    trip_id: int
    place_id: int
    liked: bool
    pass


class SwipeOut(SwipeBase):
    id: int
    user_id: int
    trip_id: int
    place_id: int
    liked: bool


    class Config:
        orm_mode = True


class RoutePoint(BaseModel):
    place_id: int
    latitude: float
    longitude: float


class RouteResponse(BaseModel):
    ordered_points: List[RoutePoint]
    estimated_total_time_minutes: float
