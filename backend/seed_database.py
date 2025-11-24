import random
from datetime import datetime
from app.database import SessionLocal
from app import models

db = SessionLocal()

def reset_database():
    # Borra todos los registros sin borrar el schema
    db.query(models.RoutePoint).delete()
    db.query(models.Route).delete()
    db.query(models.TripPlace).delete()
    db.query(models.Swipe).delete()
    db.query(models.Trip).delete()
    db.query(models.PlaceCategory).delete()
    db.query(models.Category).delete()
    db.query(models.Place).delete()
    db.query(models.User).delete()
    db.commit()
    print("Base limpia y lista para sembrar datos.")


def seed_users():
    users = [
        models.User(email="moises@test.com", password_hash="hash1"),
        models.User(email="ana@example.com", password_hash="hash2"),
        models.User(email="carlos@example.com", password_hash="hash3")
    ]
    db.add_all(users)
    db.commit()
    for u in users:
        db.refresh(u)
    print("Usuarios creados:", [u.id for u in users])
    return users


def seed_places():
    places = [
        # Paris
        models.Place(name="Louvre", description="Museo icónico", city="Paris", country="Francia",
                     latitude=48.8606, longitude=2.3376),
        models.Place(name="Torre Eiffel", description="Monumento", city="Paris", country="Francia",
                     latitude=48.8584, longitude=2.2945),
        models.Place(name="Arco del Triunfo", description="Monumento histórico", city="Paris", country="Francia",
                     latitude=48.8738, longitude=2.2950),

        # NYC
        models.Place(name="Central Park", description="Parque famoso", city="New York", country="USA",
                     latitude=40.7851, longitude=-73.9683),
        models.Place(name="Times Square", description="Centro turístico", city="New York", country="USA",
                     latitude=40.7580, longitude=-73.9855),
        models.Place(name="Empire State", description="Rascacielos icónico", city="New York", country="USA",
                     latitude=40.7484, longitude=-73.9857),

        # Tokio
        models.Place(name="Shibuya Crossing", description="Cruce famoso", city="Tokyo", country="Japón",
                     latitude=35.6595, longitude=139.7005),
        models.Place(name="Tokyo Tower", description="Torre icónica", city="Tokyo", country="Japón",
                     latitude=35.6586, longitude=139.7454),
        models.Place(name="Senso-ji Temple", description="Templo histórico", city="Tokyo", country="Japón",
                     latitude=35.7148, longitude=139.7967),
    ]

    db.add_all(places)
    db.commit()
    for p in places:
        db.refresh(p)
    print("Lugares creados:", [p.id for p in places])
    return places


def seed_trips(users):
    cities = [
        ("Paris", "Francia"),
        ("New York", "USA"),
        ("Tokyo", "Japón")
    ]

    trips = []
    for u in users:
        for (city, country) in cities[:2]:  # Cada usuario con 2 ciudades
            t = models.Trip(user_id=u.id, destination_city=city, destination_country=country)
            trips.append(t)

    db.add_all(trips)
    db.commit()
    for t in trips:
        db.refresh(t)
    print("Viajes creados:", [t.id for t in trips])
    return trips


def seed_swipes(trips, places):
    for trip in trips:
        for p in random.sample(places, 5):
            liked = random.choice([True, False])
            sw = models.Swipe(
                user_id=trip.user_id,
                trip_id=trip.id,
                place_id=p.id,
                liked=liked
            )
            db.add(sw)
    db.commit()
    print("Swipes generados para todos los viajes.")


def seed_trip_places(trips):
    for trip in trips:
        # Simular que solo los likes verdaderos se añaden al viaje final
        swipes_liked = db.query(models.Swipe).filter_by(trip_id=trip.id, liked=True).all()
        for s in swipes_liked:
            tp = models.TripPlace(trip_id=trip.id, place_id=s.place_id)
            db.add(tp)
    db.commit()
    print("Trip Places generados basados en swipes liked.")


def seed_routes(trips, places):
    for trip in trips:
        liked_places = db.query(models.TripPlace).filter_by(trip_id=trip.id).all()
        if not liked_places:
            continue

        route = models.Route(trip_id=trip.id, total_time=random.randint(30, 120))
        db.add(route)
        db.commit()
        db.refresh(route)

        order = 1
        for tp in liked_places:
            place = db.query(models.Place).filter_by(id=tp.place_id).first()
            rp = models.RoutePoint(
                route_id=route.id,
                place_id=place.id,
                step_order=order,
                latitude=place.latitude,
                longitude=place.longitude,
                estimated_time=random.randint(5, 30)
            )
            db.add(rp)
            order += 1

    db.commit()
    print("Rutas y puntos generados.")


if __name__ == "__main__":
    print("Reseteando base…")
    reset_database()

    print("\nSembrando usuarios…")
    users = seed_users()

    print("\nSembrando lugares…")
    places = seed_places()

    print("\nSembrando viajes…")
    trips = seed_trips(users)

    print("\nSembrando swipes…")
    seed_swipes(trips, places)

    print("\nGenerando trip_places…")
    seed_trip_places(trips)

    print("\nGenerando rutas…")
    seed_routes(trips, places)

    print("\nSEED COMPLETO ✔")
