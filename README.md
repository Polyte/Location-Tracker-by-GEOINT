![Location](https://github.com/user-attachments/assets/504c41d7-d71c-4fe2-b904-7e4569d1c954)

# Location Tracker

A full-stack web application for tracking locations using Docker, PostgreSQL/PostGIS, FastAPI, and React. This application provides a modern interface for managing and visualizing geographical data.

## Features

- Interactive map interface for location visualization
- Add new points of interest (locations) with custom attributes
- View locations on a map and in a sortable/filterable list
- Import points from a CSV file into the database
- Export location data in various formats
- Access locations served by a middleware API as GeoJSON for frontend map rendering
- Real-time updates and data synchronization
- Responsive design for desktop and mobile devices

## Prerequisites

- Git
- Python3 (version 3.6 or higher)
- Node.js (version 14 or higher)
- npm (version 6 or higher)
- PostgreSQL (version 14 or higher)
- PostGIS extension (for PostgreSQL)

## Installation

### PostgreSQL Setup

1. Install PostgreSQL if you haven't already:
   ```bash
   brew install postgresql
   ```

2. Start PostgreSQL service:
   ```bash
   brew services start postgresql
   ```

3. Create the postgres role (if it doesn't exist):
   ```bash
   createuser -s postgres
   ```

4. Create the database:
   ```bash
   createdb -U postgres location_tracker
   ```

5. Enable PostGIS extension:
   ```bash
   psql -U postgres -d location_tracker -c "CREATE EXTENSION postgis;"
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=location_tracker
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/Polyte/Location-Tracker-by-GEOINT
   cd Location-Tracker-by-GEOINT
   ```

2. Create and configure the `.env` file as described above

3. Start the application:
   ```bash
   docker compose build

   Then run:
   ```bash
   docker compose up -d # -d runs the containers in the background
   ```

## Development Setup

### Backend Development

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend Development

```bash
cd frontend
npm install
npm start
```

## Project Structure

```
Location-Tracker-by-GEOINT/
├── backend/           # FastAPI application
│   ├── app/          # Application code
│   ├── tests/        # Backend tests
│   └── requirements.txt
├── frontend/         # React application
│   ├── src/          # Source code
│   ├── public/       # Static files
│   └── package.json
├── db/               # Database initialization scripts
│   └── init.sql
└── docker-compose.yml
```

## API Endpoints

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Backend API Locations: http://localhost:8000/locations/geojson
   - API Documentation: http://localhost:8000/docs

### Location Management

- `POST /locations`: Add a new location
- `GET /locations`: List all locations
- `GET /locations/{id}`: Get a specific location
- `PUT /locations/{id}`: Update a location
- `DELETE /locations/{id}`: Delete a location
- `GET /locations/geojson`: Return all locations as GeoJSON

### Data Import/Export

- `POST /import`: Import locations from a CSV file
- `GET /export`: Export locations in various formats

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the GEOINT License - see the LICENSE file for details.
