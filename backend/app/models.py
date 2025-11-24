from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    trips = relationship("Trip", back_populates="user", cascade="all, delete-orphan")
    swipes = relationship("Swipe", back_populates="user", cascade="all, delete-orphan")


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    destination_city = Column(String, nullable=False, index=True)
    destination_country = Column(String, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="trips")
    swipes = relationship("Swipe", back_populates="trip", cascade="all, delete-orphan")
    trip_places = relationship("TripPlace", back_populates="trip", cascade="all, delete-orphan")
    routes = relationship("Route", back_populates="trip", cascade="all, delete-orphan")


class Place(Base):
    __tablename__ = "places"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    city = Column(String, nullable=False, index=True)
    country = Column(String, nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    image_url = Column(Text)
    is_active = Column(Boolean, default=True)

    place_categories = relationship("PlaceCategory", back_populates="place", cascade="all, delete-orphan")
    swipes = relationship("Swipe", back_populates="place", cascade="all, delete-orphan")
    trip_places = relationship("TripPlace", back_populates="place", cascade="all, delete-orphan")
    route_points = relationship("RoutePoint", back_populates="place")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    place_categories = relationship("PlaceCategory", back_populates="category", cascade="all, delete-orphan")


class PlaceCategory(Base):
    __tablename__ = "place_categories"
    __table_args__ = (
        UniqueConstraint("place_id", "category_id", name="uq_place_category"),
    )

    place_id = Column(Integer, ForeignKey("places.id"), primary_key=True)
    category_id = Column(Integer, ForeignKey("categories.id"), primary_key=True)

    place = relationship("Place", back_populates="place_categories")
    category = relationship("Category", back_populates="place_categories")


class Swipe(Base):
    __tablename__ = "swipes"
    __table_args__ = (
        UniqueConstraint("user_id", "trip_id", "place_id", name="uq_swipe_user_trip_place"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False, index=True)
    place_id = Column(Integer, ForeignKey("places.id"), nullable=False, index=True)
    liked = Column(Boolean, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="swipes")
    trip = relationship("Trip", back_populates="swipes")
    place = relationship("Place", back_populates="swipes")


class TripPlace(Base):
    __tablename__ = "trip_places"
    __table_args__ = (
        UniqueConstraint("trip_id", "place_id", name="uq_trip_place"),
    )

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False, index=True)
    place_id = Column(Integer, ForeignKey("places.id"), nullable=False, index=True)
    added_at = Column(DateTime, default=datetime.utcnow)

    trip = relationship("Trip", back_populates="trip_places")
    place = relationship("Place", back_populates="trip_places")


class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=False, index=True)
    total_time = Column(Float)
    total_distance = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    trip = relationship("Trip", back_populates="routes")
    points = relationship("RoutePoint", back_populates="route", cascade="all, delete-orphan")


class RoutePoint(Base):
    __tablename__ = "route_points"

    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False, index=True)
    place_id = Column(Integer, ForeignKey("places.id"), nullable=False, index=True)
    step_order = Column(Integer, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    estimated_time = Column(Float)

    route = relationship("Route", back_populates="points")
    place = relationship("Place", back_populates="route_points")
