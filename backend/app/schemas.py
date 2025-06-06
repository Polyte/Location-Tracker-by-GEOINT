from pydantic import BaseModel
from typing import Optional

class LocationBase(BaseModel):
    name: str
    category: str
    latitude: float
    longitude: float

class LocationCreate(LocationBase):
    pass

class Location(LocationBase):
    id: int

    class Config:
        from_attributes = True 