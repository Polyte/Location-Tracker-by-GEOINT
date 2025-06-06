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

- Docker (version 20.10.0 or higher)
- Docker Compose (version 2.0.0 or higher)
- Git

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_password
POSTGRES_DB=location_tracker
POSTGRES_HOST=db
POSTGRES_PORT=5432
```

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Location-Tracker-by-GEOINT
   ```

2. Create and configure the `.env` file as described above

3. Start the application:
   ```bash
   docker-compose up --build
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Development Setup

### Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
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