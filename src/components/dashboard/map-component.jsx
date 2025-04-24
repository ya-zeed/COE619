'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for default marker icon issue in react-leaflet
// Keep this fix if you still want the standard Leaflet icon shape
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});


// --- Custom Colored Icons ---
// Define icon options for different colors
const createColoredIcon = (color) => {
  // Using URLs from the 'leaflet-color-markers' project as examples.
  // You can replace these with paths to your own marker image files.
  let iconUrl;
  let shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png'; // Standard shadow

  switch (color) {
    case 'green':
      iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png';
      break;
    case 'red':
      iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';
      break;
    case 'orange':
      iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png';
      break;
    default: // Default color for other statuses or if status is missing
      iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png';
      break;
  }

  return new L.Icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconUrl, // Often use the same for retina @2x
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// Create icon instances outside the component to avoid re-creation on every render
const greenIcon = createColoredIcon('green');
const redIcon = createColoredIcon('red');
const orangeIcon = createColoredIcon('orange');
const blueIcon = createColoredIcon('blue'); // Default icon


// Add this new component before the main MapComponent
function MapController({ selectedNode, defaultCenter }) {
  const map = useMap();

  useEffect(() => {
    if (selectedNode && selectedNode.latitude != null && selectedNode.longitude != null) {
       // Fly to selected node location
      map.flyTo([selectedNode.latitude, selectedNode.longitude], 15);
    } else if (!selectedNode) {
        // Optional: Fly back to default center if no node is selected
        // map.flyTo(defaultCenter, 13);
    }
  }, [selectedNode, map]); // Depend on selectedNode and map instance

  return null; // This component doesn't render anything itself
}

// RecenterButton component (moved inside MapComponent or kept outside if desired)
function RecenterButton({ defaultCenter }) {
    const map = useMap();
    return (
      <button
        className="absolute z-[1000] top-4 right-4 bg-white px-4 py-2 rounded-md shadow-md hover:bg-gray-100 text-gray-700 text-sm font-medium"
        onClick={() => map.setView(defaultCenter, 13)}
      >
        Recenter Map
      </button>
    );
}


export default function MapComponent({ nodes, selectedNodeId, onMarkerClick }) {
  const defaultCenter = [24.7136, 46.6753]; // Riyadh, Saudi Arabia coordinates

  // Find the selected node
  const selectedNode = nodes?.find(node => node.node_id === selectedNodeId);

  // Function to determine the correct icon based on node status
  const getNodeIcon = (status) => {
    switch (status) {
      case 'online':
        return greenIcon;
      case 'offline':
        return redIcon;
      default:
        return orangeIcon; // Use orange for 'Other' or undefined statuses
    }
  };

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg"
      // Add this prop if you want map instance in state/ref
      // whenCreated={mapInstance => { /* store mapInstance */ }}
    >
      {/* Pass defaultCenter to RecenterButton */}
      <RecenterButton defaultCenter={defaultCenter} />
      {/* Pass defaultCenter to MapController if needed for recentering logic */}
      <MapController selectedNode={selectedNode} defaultCenter={defaultCenter} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Map through nodes and create a Marker for each */}
      {nodes?.map((node) => {
           // Ensure node has latitude and longitude
           if (node.latitude == null || node.longitude == null) {
               console.warn(`Node ${node.node_id} is missing latitude or longitude.`);
               return null; // Skip rendering marker if location data is missing
           }

           // Get the appropriate icon based on node status
           const markerIcon = getNodeIcon(node.node_status);

           return (
                <Marker
                    // Use node_id as a unique key
                    key={node.node_id}
                    // Use the latitude and longitude properties
                    position={[node.latitude, node.longitude]}
                    // Assign the custom colored icon
                    icon={markerIcon}
                    // Use eventHandlers prop for events like click
                    eventHandlers={{
                        click: () => {
                            // Call the onMarkerClick function passed from the parent,
                            // passing the node_id as expected by NodeList.
                            onMarkerClick(node.node_id);
                        },
                         // You could also add mouseover, mouseout events etc.
                    }}
                    // Optional: Add a title for tooltip on hover
                    title={node.node_name || `Node ${node.node_id}`}
                >
                  {/* Popup content */}
                  <Popup>
                    <div>
                      <h3 className="text-base font-semibold">{node.node_name || `Node ${node.node_id}`}</h3>
                      <p className="text-sm text-gray-600">Status: {node.node_status || 'Unknown Status'}</p>
                       <a href={`/node/${node.node_id}`} className="text-blue-500 hover:underline text-sm mt-2 inline-block">View Details</a>
                    </div>
                  </Popup>
                </Marker>
           );
      })}
    </MapContainer>
  );
}