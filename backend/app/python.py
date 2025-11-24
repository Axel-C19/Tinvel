from app.database import SessionLocal
from app import models

db = SessionLocal()
u = models.User(email="test@example.com", password_hash="fakehash")
db.add(u)
db.commit()
db.refresh(u)
print(u.id)
db.close()
