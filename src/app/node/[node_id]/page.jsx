'use client';
import { useState, useEffect, useMemo, useCallback } from 'react'; // Import useCallback
import api from '@/lib/api'; // Assuming '@/lib/api' exists and works
import { format, formatDistanceToNowStrict } from 'date-fns';
import { useParams } from 'next/navigation';

// --- Simple UI Components (using Tailwind CSS) ---

const SimpleLoading = () => (
    <div className="flex flex-col justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-50 mb-4"></div>
        <p className="text-xl text-gray-600">Loading node details...</p>
    </div>
);

const SimpleErrorDisplay = ({ message }) => (
    <div className="flex justify-center items-center h-screen p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-md shadow-md" role="alert">
            <strong className="font-bold mr-2">Error:</strong>
            <span className="block sm:inline">{message}</span>
        </div>
    </div>
);

const SimpleCard = ({ children, className }) => (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
        {children}
    </div>
);

const SimpleCardHeader = ({ children }) => (
    <div className="px-6 py-4 border-b border-gray-200">
        {children}
    </div>
);

const SimpleCardTitle = ({ children, className }) => (
    <h2 className={`text-xl font-semibold text-gray-800 ${className}`}>
        {children}
    </h2>
);

const SimpleCardContent = ({ children, className }) => (
    <div className={`p-6 ${className}`}>
        {children}
    </div>
);

const SimpleBadge = ({ children, variant = 'default', className }) => {
    const baseStyle = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    const variants = {
        default: "bg-blue-100 text-blue-800",
        secondary: "bg-gray-100 text-gray-800",
        success: "bg-green-100 text-green-800",
        danger: "bg-red-100 text-red-800",
        warning: "bg-yellow-100 text-yellow-800",
        outline: "border border-gray-300 text-gray-700"
    };
    return (
        <span className={`${baseStyle} ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

const SimpleAlert = ({ title, description, variant = 'info' }) => {
    const variants = {
        info: "bg-blue-100 border-blue-500 text-blue-800",
        warning: "bg-yellow-100 border-yellow-500 text-yellow-800",
        danger: "bg-red-100 border-red-500 text-red-800",
    };
    return (
        <div className={`${variants[variant]} border-l-4 p-4`} role="alert">
            {title && <p className="font-bold mb-1">{title}</p>}
            {description && <p>{description}</p>}
        </div>
    );
};

// --- Main Component ---

export default function NodeDetails() {
    const [node, setNode] = useState(null);
    const [allEvents, setAllEvents] = useState([]); // Store all fetched events
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // State to handle errors
    const [filterType, setFilterType] = useState('all'); // State for event type filter
    const [filterStatus, setFilterStatus] = useState('all'); // State for event status filter
    const params = useParams();

    const nodeId = useMemo(() => params?.node_id, [params?.node_id]);

    useEffect(() => {
        const fetchNodeData = async () => {
            if (!nodeId) {
                setLoading(false);
                setError("No node ID provided in the URL.");
                return;
            }
            setLoading(true);
            setError(null); // Clear previous errors
            setAllEvents([]); // Clear previous events
            setNode(null); // Clear previous node data

            try {
                const [nodeData, eventsData] = await Promise.all([
                    api.getNode(nodeId),
                    api.getNodeEvents(nodeId)
                ]);

                if (!nodeData) {
                     setError(`Node with ID "${nodeId}" not found.`);
                } else {
                    setNode(nodeData);
                     // Sort events by timestamp in descending order (most recent first)
                    setAllEvents(eventsData.sort((a, b) => parseInt(b.event_timestamp) - parseInt(a.event_timestamp)));
                }
            } catch (err) {
                console.error('Error fetching node data:', err);
                setError("Failed to load node details. Please check the node ID and network connection."); // Set a user-friendly error message
            } finally {
                setLoading(false);
            }
        };
        fetchNodeData();
    }, [nodeId]); // Depend on nodeId

    // Filter events based on selected filters
    const filteredEvents = useMemo(() => {
        return allEvents.filter(event => {
            const typeMatch = filterType === 'all' || (event.event_type && event.event_type === filterType);
            const statusMatch = filterStatus === 'all' || (event.event_status && event.event_status === filterStatus);
            return typeMatch && statusMatch;
        });
    }, [allEvents, filterType, filterStatus]); // Re-filter when allEvents or filters change

    // Calculate unique event types and statuses for filter options
    const uniqueEventTypes = useMemo(() => {
        const types = new Set(allEvents.map(event => event.event_type).filter(Boolean));
        return ['all', ...Array.from(types)];
    }, [allEvents]);

    const uniqueEventStatuses = useMemo(() => {
        const statuses = new Set(allEvents.map(event => event.event_status).filter(Boolean));
        return ['all', ...Array.from(statuses)];
    }, [allEvents]);


    // Calculate statistics using useMemo based on FILTERED events
    const eventStats = useMemo(() => {
        const totalFilteredEvents = filteredEvents.length;
        const eventTypeCounts = filteredEvents.reduce((acc, event) => {
            const type = event.event_type || 'Unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});
         const eventStatusCounts = filteredEvents.reduce((acc, event) => {
            const status = event.event_status || 'Unknown';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
        // Get timestamp of the first event in the filtered list (since it's sorted by timestamp desc)
        const lastEventTimestamp = filteredEvents.length > 0 ? parseInt(filteredEvents[0].event_timestamp) * 1000 : null;
        const timeSinceLastEvent = lastEventTimestamp ? formatDistanceToNowStrict(new Date(lastEventTimestamp), { addSuffix: true }) : 'N/A';
        const mostFrequentEventType = Object.entries(eventTypeCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';


        return {
            totalFilteredEvents,
            eventTypeCounts,
            eventStatusCounts,
            lastEventTimestamp,
            timeSinceLastEvent,
            mostFrequentEventType
        };
    }, [filteredEvents]); // Recalculate stats whenever the filteredEvents array changes

    // Handlers for filter changes
    const handleFilterTypeChange = useCallback((event) => {
        setFilterType(event.target.value);
    }, []);

    const handleFilterStatusChange = useCallback((event) => {
        setFilterStatus(event.target.value);
    }, []);


    if (loading) {
        return <SimpleLoading />;
    }

    if (error) {
        return <SimpleErrorDisplay message={error} />;
    }

    if (!node) {
        // This case should ideally be covered by the error handling, but kept as a fallback
        return (
            <div className="container mx-auto p-6 text-center text-gray-600">
                Node details could not be loaded.
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-5xl"> {/* Increased max-width slightly */}
            {/* Node Details Card */}
            <SimpleCard>
                <SimpleCardHeader>
                    <SimpleCardTitle className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-2xl">{node.node_name || `Node ID: ${node.node_id || 'Unknown'}`}</span>
                        {node.node_status && (
                             <SimpleBadge variant={node.node_status === 'online' ? 'success' : node.node_status === 'offline' ? 'secondary' : 'warning'}>
                                {node.node_status}
                            </SimpleBadge>
                        )}
                    </SimpleCardTitle>
                </SimpleCardHeader>
                <SimpleCardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 text-sm">
                        <div>
                            <p className="text-gray-500 font-medium">Node ID:</p>
                            <p className="font-semibold text-gray-700">{node.node_id || 'N/A'}</p>
                        </div>
                         <div>
                            <p className="text-gray-500 font-medium">Current Status:</p>
                            <p className="font-semibold text-gray-700">{node.node_status || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 font-medium">Location:</p>
                            <p className="font-semibold text-gray-700">
                                {node.latitude != null && node.longitude != null ? `${node.latitude}, ${node.longitude}` : 'Location Unknown'}
                            </p>
                        </div>
                        {/* Add more static node details if available */}
                        {/* {node.createdAt && (
                             <div>
                                <p className="text-gray-500 font-medium">Registered On:</p>
                                <p className="font-semibold text-gray-700">{format(new Date(node.createdAt), 'PPpp')}</p>
                             </div>
                        )} */}
                    </div>
                </SimpleCardContent>
            </SimpleCard>

            {/* Node Statistics Card */}
             {allEvents.length > 0 && ( // Only show stats card if there are any events fetched
                <SimpleCard>
                    <SimpleCardHeader>
                        <SimpleCardTitle>Event Statistics (Filtered)</SimpleCardTitle>
                    </SimpleCardHeader>
                    <SimpleCardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 text-sm">
                            <div>
                                <p className="text-gray-500 font-medium">Total Events (Filtered):</p>
                                <p className="font-semibold text-gray-700 text-lg">{eventStats.totalFilteredEvents} of {allEvents.length}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 font-medium">Time Since Last Filtered Event:</p>
                                <p className="font-semibold text-gray-700 text-lg">{eventStats.timeSinceLastEvent}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 font-medium">Most Frequent Filtered Event Type:</p>
                                <p className="font-semibold text-gray-700 text-lg">{eventStats.mostFrequentEventType}</p>
                            </div>
                            <div className="md:col-span-2 lg:col-span-3">
                                <p className="text-gray-500 font-medium mb-2">Event Type Breakdown (Filtered):</p>
                                <div className="flex flex-wrap gap-3">
                                    {Object.entries(eventStats.eventTypeCounts).map(([type, count]) => (
                                        <SimpleBadge key={type} variant="outline" className="text-sm px-3 py-1">
                                            {type}: <span className="font-bold ml-1">{count}</span>
                                        </SimpleBadge>
                                    ))}
                                    {Object.keys(eventStats.eventTypeCounts).length === 0 && (
                                        <p className="text-gray-600">No event types match current filters.</p>
                                    )}
                                </div>
                            </div>
                            <div className="md:col-span-2 lg:col-span-3">
                                <p className="text-gray-500 font-medium mb-2">Event Status Breakdown (Filtered):</p>
                                <div className="flex flex-wrap gap-3">
                                    {Object.entries(eventStats.eventStatusCounts).map(([status, count]) => (
                                        <SimpleBadge key={status} variant="outline" className="text-sm px-3 py-1">
                                            {status}: <span className="font-bold ml-1">{count}</span>
                                        </SimpleBadge>
                                    ))}
                                     {Object.keys(eventStats.eventStatusCounts).length === 0 && (
                                        <p className="text-gray-600">No event statuses match current filters.</p>
                                     )}
                                </div>
                            </div>
                        </div>
                    </SimpleCardContent>
                </SimpleCard>
            )}


            {/* Events List */}
            <SimpleCard>
                <SimpleCardHeader>
                    <SimpleCardTitle className="flex items-center justify-between flex-wrap gap-2">
                        <span>Event History</span>
                         <div className="flex items-center gap-4">
                             <div className="flex items-center gap-2 text-sm text-gray-700">
                                 <label htmlFor="type-filter" className="font-medium">Type:</label>
                                 <select
                                     id="type-filter"
                                     className="border border-gray-300 rounded-md p-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                                     value={filterType}
                                     onChange={handleFilterTypeChange}
                                 >
                                     {uniqueEventTypes.map(type => (
                                         <option key={type} value={type}>
                                             {type === 'all' ? 'All Types' : type}
                                         </option>
                                     ))}
                                 </select>
                             </div>
                             <div className="flex items-center gap-2 text-sm text-gray-700">
                                 <label htmlFor="status-filter" className="font-medium">Status:</label>
                                 <select
                                     id="status-filter"
                                     className="border border-gray-300 rounded-md p-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                                     value={filterStatus}
                                     onChange={handleFilterStatusChange}
                                 >
                                      {uniqueEventStatuses.map(status => (
                                         <option key={status} value={status}>
                                             {status === 'all' ? 'All Statuses' : status}
                                         </option>
                                     ))}
                                 </select>
                             </div>
                         </div>
                    </SimpleCardTitle>
                </SimpleCardHeader>
                <SimpleCardContent className="p-0">
                    {filteredEvents.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                            {filteredEvents.map((event, index) => (
                                // Using event_id as key if available, otherwise index (less ideal)
                                <div key={event.event_id || index} className="p-6 hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                                    <div className="flex flex-col space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800">{event.event_type || 'Unknown Event Type'}</h3>
                                                {event.description && (
                                                    <p className="text-gray-600 mt-1 text-sm">{event.description}</p>
                                                )}
                                                {event.event_status && (
                                                    <div className="text-sm text-gray-500 mt-2">
                                                        Status: <SimpleBadge variant="outline">{event.event_status}</SimpleBadge>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500 flex-shrink-0 ml-4 text-right">
                                                {/* Using a more detailed and readable format */}
                                                {event.event_timestamp ?
                                                    format(new Date(parseInt(event.event_timestamp) * 1000), 'MMM dd, yyyy HH:mm:ss')
                                                    : 'Timestamp N/A'
                                                }
                                            </div>
                                        </div>
                                        {event.image && (
                                            <div className="mt-4 flex justify-center">
                                                <img
                                                    src={`data:image/jpeg;base64,${event.image}`}
                                                    alt={`Image for ${event.event_type || 'an event'}`}
                                                    className="rounded-lg max-h-96 w-auto border border-gray-200 shadow-sm object-contain"
                                                    loading="lazy"
                                                />
                                            </div>
                                        )}
                                        {event.event_details && (
                                            <div className="text-sm text-gray-700 bg-gray-100 p-4 rounded-md mt-3">
                                                <p className="font-medium mb-2 border-b border-gray-200 pb-1 text-gray-600">Details:</p>
                                                <p className="whitespace-pre-wrap">{event.event_details}</p> {/* Preserve whitespace/newlines */}
                                            </div>
                                        )}
                                        {(event.latitude != null || event.longitude != null) && (
                                            <div className="text-sm text-gray-500 mt-3">
                                                Event Location: {event.latitude != null && event.longitude != null ? `${event.latitude}, ${event.longitude}` : 'Location Unknown'}
                                            </div>
                                        )}
                                        {/* Add more event specific details if available */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 text-center text-gray-500">
                           <SimpleAlert
                                title="No Matching Events"
                                description="No events found matching the selected filter criteria."
                                variant="info"
                           />
                        </div>
                    )}
                </SimpleCardContent>
            </SimpleCard>
        </div>
    );
}