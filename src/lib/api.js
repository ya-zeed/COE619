const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

// Generic fetch wrapper with error handling
async function fetchApi(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  try {
    const response = await fetch(`${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Failed:', error);
    throw error;
  }
}

// Common API methods
export const api = {
  getAllNodes: async () => {
    try {
      return await fetchApi('/api/prod/all-nodes');
    } catch (error) {
      console.error('Error fetching nodes:', error);
      return [];
    }
  },

  // Get all events
  getAllEvents: async () => {
    try {
      const events = await fetchApi('/api/prod/all-events');
      return events.filter(event => event.edge_node_id != null);
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  },

  // Get single node details
  getNode: async (nodeId) => {
    const response = await fetch(`/api/prod/edge-node?node_id=${nodeId}`);
    if (!response.ok) throw new Error('Failed to fetch node');
    return response.json();
  },

  // Get events for a specific node
  getNodeEvents: async (nodeId) => {
    try {
      const allEvents = await api.getAllEvents();
      return allEvents.filter(event => event.edge_node_id === nodeId);
    } catch (error) {
      console.error('Error fetching node events:', error);
      return [];
    }
  },

  // Get single event details
  getEvent: async (eventId) => {
    try {
      return await fetchApi(`/api/prod/event?event_id=${eventId}`);
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  },
};

export default api;
