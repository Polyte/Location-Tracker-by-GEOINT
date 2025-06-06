import csv
from io import StringIO
from sqlalchemy.orm import Session
from . import models, schemas
from geoalchemy2.shape import from_shape
from shapely.geometry import Point
import logging
from fastapi import HTTPException
from . import crud

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def import_csv(db: Session, file):
    try:
        # Read the CSV file
        contents = file.file.read().decode('utf-8')
        csv_file = StringIO(contents)
        reader = csv.DictReader(csv_file)
        
        imported = 0
        errors = []
        
        # Process each row
        for row_num, row in enumerate(reader, start=2):  # start=2 because row 1 is header
            try:
                # Validate required fields
                if not all(key in row for key in ['Name', 'Category', 'Latitude', 'Longitude']):
                    errors.append(f"Row {row_num}: Missing required fields")
                    continue
                
                # Convert coordinates to float
                try:
                    latitude = float(row['Latitude'])
                    longitude = float(row['Longitude'])
                except ValueError:
                    errors.append(f"Row {row_num}: Invalid coordinates")
                    continue
                
                # Create location
                location = schemas.LocationCreate(
                    name=row['Name'],
                    category=row['Category'],
                    latitude=latitude,
                    longitude=longitude
                )
                
                crud.create_location(db, location)
                imported += 1
                
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
        
        return {
            "imported": imported,
            "errors": errors
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        file.file.close() 