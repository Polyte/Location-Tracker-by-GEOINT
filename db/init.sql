CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    geom geometry(Point, 4326)
);

CREATE INDEX IF NOT EXISTS idx_locations_geom ON locations USING GIST (geom); 