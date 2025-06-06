from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from . import crud, schemas, csv_import
from .database import get_db, engine, Base, init_db
from sqlalchemy.orm import Session
from fastapi import Depends

# Initialize database
init_db()

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Explicitly allow frontend origin
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

@app.post("/locations", response_model=schemas.Location)
def create_location(location: schemas.LocationCreate, db: Session = Depends(get_db)):
    return crud.create_location(db=db, location=location)

@app.get("/locations", response_model=list[schemas.Location])
def read_locations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_locations(db, skip=skip, limit=limit)

@app.get("/locations/geojson")
def read_locations_geojson(db: Session = Depends(get_db)):
    return crud.get_locations_geojson(db)

@app.post("/import")
def import_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    return csv_import.import_csv(db, file)

@app.delete("/locations")
def delete_all_locations(db: Session = Depends(get_db)):
    return crud.delete_all_locations(db) 