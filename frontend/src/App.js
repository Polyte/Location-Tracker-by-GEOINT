import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
 // main app component
function App() {
  const mapContainer = useRef(null);
 
  const fileInputRef = useRef(null);
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState({ name: '', category: '', latitude: '', longitude: '' });
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadErrors, setUploadErrors] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [addStatus, setAddStatus] = useState('');
  const [addError, setAddError] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const popupRef = useRef(null);
  const [mapStyle, setMapStyle] = useState('satellite'); // Changed from 'normal' to 'satellite'
  const MAPTILER_KEY = 'Mzz4D0DNC0EOqwMrDxc6';
  const map = useRef(null);

  const mapStyles = {
    normal: 'https://demotiles.maplibre.org/style.json',
    satellite: `https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`
  };

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyles[mapStyle],
      center: [28.0473, -26.1072], // Center on Sandton
      zoom: 15.5,
      pitch: 45,
      bearing: -17.6,
      container: 'map',
      canvasContextAttributes: {antialias: true}
    });

    map.current.on('load', () => {
      fetchLocations();
      const layers = map.current.getStyle().layers;

      let labelLayerId;
      for (let i = 0; i < layers.length; i++) {
          if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
              labelLayerId = layers[i].id;
              break;
          }
      }
    
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);
   // toggle map style between normal and satellite view
  const toggleMapStyle = () => {
   
    
    // Remove existing source and layer if they exist
    const layers = map.current.getStyle().layers;

    let labelLayerId;
    for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
            labelLayerId = layers[i].id;
            break;
        }
    }
    
    // Re-add the locations layer after style change
    map.current.on('style.load', () => {
      if (locations.length > 0) {
        map.current.addSource('locations', {
          type: 'fill-extrusion',
          data: {
            type: 'FeatureCollection',
            features: locations
          }
        });

        map.current.addSource('openmaptiles', {
          url: `https://api.maptiler.com/tiles/v3/tiles.json?key=${MAPTILER_KEY}`,
          type: 'vector',
      });

      
        map.current.addLayer({
         'id': '3d-buildings',
            'source': 'openmaptiles',
            'source-layer': 'building',
            'type': 'fill-extrusion',
            'minzoom': 15,
            'filter': ['!=', ['get', 'hide_3d'], true],
            'paint': {
                'fill-extrusion-color': [
                    'interpolate',
                    ['linear'],
                    ['get', 'render_height'], 6, 'lightgray', 200, 'royalblue', 400, 'lightblue'
                ],
                'fill-extrusion-height': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    16,
                    ['get', 'render_height']
                ],
                'fill-extrusion-base': ['case',
                    ['>=', ['get', 'zoom'], 16],
                    ['get', 'render_min_height'], 0
                ]
            }
        });

        // If there's a selected location, re-add its popup
        if (selectedLocation) {
          if (popupRef.current) {
            popupRef.current.remove();
          }
          popupRef.current = new maplibregl.Popup({ offset: 25 })
            .setLngLat(selectedLocation.geometry.coordinates)
            .setHTML(`
              <div class="p-2">
                <h3 class="font-bold">${selectedLocation.properties.name}</h3>
                <p class="text-sm">${selectedLocation.properties.category}</p>
                <p class="text-xs text-gray-600">
                  Coordinates: ${selectedLocation.geometry.coordinates[1]}, ${selectedLocation.geometry.coordinates[0]}
                </p>
              </div>
            `);
          popupRef.current.addTo(map.current);
        }
      }
    });
  };
  // fetch locations from backend and display on map
  const fetchLocations = async () => {
    try {
      const response = await fetch('http://localhost:8000/locations/geojson');
      const data = await response.json();
      setLocations(data.features);

      if (map.current) {
        if (map.current.getSource('locations')) {
          map.current.getSource('locations').setData(data);
        } else {
          map.current.addSource('locations', {
            type: 'geojson',
            data: data
          });

          map.current.addLayer({
            id: 'locations',
            type: 'circle',
            source: 'locations',
            paint: {
              'circle-radius': 6,
              'circle-color': '#B42222'
            }
          });
        }
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAddStatus('');
    setAddError('');
    
    // Simple validation of all fields
    if (!newLocation.name || !newLocation.category || !newLocation.latitude || !newLocation.longitude) {
      setAddError('All fields are required.');
      return;
    }
    
    // Convert string values to numbers for latitude and longitude
    const locationData = {
      name: newLocation.name,
      category: newLocation.category,
      latitude: parseFloat(newLocation.latitude),
      longitude: parseFloat(newLocation.longitude)
    };
    // validate latitude and longitude
    if (isNaN(locationData.latitude) || isNaN(locationData.longitude)) {
      setAddError('Latitude and Longitude must be valid numbers.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add location');
      }

      const result = await response.json();
      setAddStatus('Location added successfully!');
      setNewLocation({ name: '', category: '', latitude: '', longitude: '' });
      fetchLocations();
    } catch (error) {
      console.error('Error adding location:', error);
      setAddError(error.message || 'Error adding location');
    }
  };
  // select file from local machine
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setUploadStatus('Please select a CSV file');
        setUploadErrors([]);
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setUploadStatus('File selected: ' + file.name);
      setUploadErrors([]);
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    // upload file to backend
    try {
      setUploadStatus('Uploading...');
      setUploadErrors([]);
      const response = await fetch('http://localhost:8000/import', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      
      if (result.error) {
        setUploadStatus('Error: ' + result.error);
        setUploadErrors([]);
      } else {
        setUploadStatus(`Successfully imported ${result.imported} locations`);
        if (result.errors && result.errors.length > 0) {
          setUploadErrors(result.errors);
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setSelectedFile(null);
      }
      fetchLocations();
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('Error uploading file');
      setUploadErrors([]);
    }
  };
   // 
  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete all locations? This action cannot be undone.')) {
      return;
    }
   // clear all locations
    try {
      const response = await fetch('http://localhost:8000/locations', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear locations');
      }
      // Set the locations to an empty array
      setLocations([]);
      if (map.current && map.current.getSource('locations')) {
        map.current.getSource('locations').setData({
          type: 'FeatureCollection',
          features: []
        });
      }
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
      setSelectedLocation(null);
    } catch (error) {
      console.error('Error clearing locations:', error);
      alert('Failed to clear locations. Please try again.');
    }
  };

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
    
    // Remove existing popup if any
    if (popupRef.current) {
      popupRef.current.remove();
    }

    // Create new popup
    popupRef.current = new maplibregl.Popup({ offset: 25 })
      .setLngLat(location.geometry.coordinates)
      .setHTML(`
        <div class="p-2">
          <h3 class="font-bold">${location.properties.name}</h3>
          <p class="text-sm">${location.properties.category}</p>
          <p class="text-xs text-gray-600">
            Coordinates: ${location.geometry.coordinates[1]}, ${location.geometry.coordinates[0]}
          </p>
        </div>
      `);

    // Add popup to map
    popupRef.current.addTo(map.current);

    // Fly to location
    map.current.flyTo({
      center: location.geometry.coordinates,
      zoom: 15,
      essential: true
    });
  }

  // Add new function to get current location
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    if (!navigator.geolocation) {
      setAddError('Geolocation is not supported by your browser');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setNewLocation({
          ...newLocation,
          latitude: latitude.toString(),
          longitude: longitude.toString()
        });
        setIsGettingLocation(false);
      },
      (error) => {
        setAddError('Unable to retrieve your location: ' + error.message);
        setIsGettingLocation(false);
      }
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Location Tracker by <span style={{ color:'#5ba7d2', }}>GEOINT</span></h1>
      
      <div className="relative">
        <div ref={mapContainer} className="map-container mb-6" style={{ height: '500px' }} id="map"/>
        <button
          onClick={toggleMapStyle}
          className="absolute top-4 right-4 bg-white px-4 py-2 rounded-md shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {mapStyle === 'normal' ? 'Satellite View' : 'Normal View'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Location</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={newLocation.name}
                onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Category"
                value={newLocation.category}
                onChange={(e) => setNewLocation({ ...newLocation, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Latitude"
                  value={newLocation.latitude}
                  onChange={(e) => setNewLocation({ ...newLocation, latitude: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Longitude"
                  value={newLocation.longitude}
                  onChange={(e) => setNewLocation({ ...newLocation, longitude: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className={`px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isGettingLocation 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  }`}
                >
                  {isGettingLocation ? 'Getting Location...' : '📍'}
                </button>
              </div>
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Add Location
              </button>
              {addStatus && (
                <div className="mt-2 p-2 bg-green-100 text-green-800 rounded">{addStatus}</div>
              )}
              {addError && (
                <div className="mt-2 p-2 bg-red-100 text-red-800 rounded">{addError}</div>
              )}
            </form>
          </div>
       
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Import Locations from CSV(POI)</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile}
                  className={`px-6 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    selectedFile 
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Upload
                </button>
              </div>
              
              {uploadStatus && (
                <div className={`p-4 rounded-md ${
                  uploadStatus.includes('Error') 
                    ? 'bg-red-50 text-red-700' 
                    : 'bg-green-50 text-green-700'
                }`}>
                  {uploadStatus}
                </div>
              )}
              
              {uploadErrors.length > 0 && (
                <div className="bg-orange-50 p-4 rounded-md text-orange-700">
                  <h4 className="font-semibold mb-2">Import Warnings:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {uploadErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="text-sm text-gray-500">
                CSV format: Name,Category,Latitude,Longitude
              </div>
            </div>
          </div>
        </div>
 
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Locations List</h2>
          {locations.length > 0 && (
            <div className="mb-4">
              <button
                onClick={handleClearAll}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Clear All Locations
              </button>
            </div>
          )}
          <ul className="space-y-3">
            {locations.map(loc => (
              <li 
                key={loc.properties.id}
                onClick={() => handleLocationClick(loc)}
                className={`p-4 rounded-md hover:bg-gray-100 transition-colors cursor-pointer ${
                  selectedLocation?.properties.id === loc.properties.id 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-gray-50'
                }`}
              >
                <div className="font-medium text-gray-900">{loc.properties.name}</div>
                <div className="text-sm text-gray-600">{loc.properties.category}</div>
                <div className="text-sm text-gray-500">
                  Coordinates: {loc.geometry.coordinates[1]}, {loc.geometry.coordinates[0]}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App; 