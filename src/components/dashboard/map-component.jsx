'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for default marker icon issue in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Add this new component before the main MapComponent
function MapController({ selectedNode }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedNode) {
      map.flyTo([selectedNode.latitude, selectedNode.longitude], 15);
    }
  }, [selectedNode, map]);

  return null;
}

export default function MapComponent({ nodes, selectedNodeId, onMarkerClick }) {
  const defaultCenter = [26.3062598, 50.1292501];
  
  // Find the selected node
  const selectedNode = nodes?.find(node => node.node_id === selectedNodeId);

  // Add RecenterButton component
  function RecenterButton() {
    const map = useMap();
    return (
      <button
        className="absolute z-[1000] top-4 right-4 bg-white px-4 py-2 rounded-md shadow-md hover:bg-gray-100"
        onClick={() => map.setView(defaultCenter, 13)}
      >
        Recenter Map
      </button>
    );
  }
  
  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg"
    >
      <RecenterButton />
      <MapController selectedNode={selectedNode} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {nodes?.map((node, index) => (
        <Marker
          key={node.id || index}
          position={[node.latitude, node.longitude]}
          onMouseClick={() => onMarkerClick(node)}
        >
          <Popup>
            <div>
              <h3>{node.node_name || `Node ${index + 1}`}</h3>
              <p>Node Status: {node.node_status || 'No description available'}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
} 