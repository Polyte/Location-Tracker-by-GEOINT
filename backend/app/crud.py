from sqlalchemy.orm import Session
from . import models, schemas

def create_location(db: Session, location: schemas.LocationCreate):
    db_location = models.Location(
        name=location.name,
        category=location.category,
        latitude=location.latitude,
        longitude=location.longitude
    )
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location

def get_locations(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Location).offset(skip).limit(limit).all()

def get_locations_geojson(db: Session):
    locations = db.query(models.Location).all()
    features = []
    for loc in locations:
        feature = {
            "type": "Feature",
            "properties": {
                "id": loc.id,
                "name": loc.name,
                "category": loc.category
            },
            "geometry": {
                "type": "Point",
                "coordinates": [loc.longitude, loc.latitude]
            }
        }
        features.append(feature)
    return {"type": "FeatureCollection", "features": features}

def delete_all_locations(db: Session):
    db.query(models.Location).delete()
    db.commit()
    return {"message": "All locations deleted successfully"} 