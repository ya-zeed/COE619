'use client';
import { useState, useEffect, useMemo, useCallback } from 'react'; // Added useMemo, useCallback
import api from '@/lib/api'; // Assuming '@/lib/api' exists and works
import { format } from 'date-fns';
import { Loading } from '@/components/loading'; // Assuming this component exists
import Link from 'next/link';

// --- Simple UI Components (using Tailwind CSS) ---
// Re-defining these here for self-containment as requested previously.
// If you are using a UI library like Shadcn UI that provides these,
// you should use those components instead and remove these definitions.

const SimpleLoading = () => (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-50 mb-4"></div>
        <p className="text-xl font-medium text-gray-600">Loading events...</p>
    </div>
);

const SimpleErrorDisplay = ({ message }) => (
    <div className="flex justify-center items-center h-screen p-6 bg-gray-50">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-md shadow-md" role="alert">
            <strong className="font-bold mr-2">Error:</strong>
            <span className="block sm:inline">{message}</span>
        </div>
    </div>
);

const SimpleCard = ({ children, className }) => (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}> {/* Added border and lighter shadow */}
        {children}
    </div>
);

const SimpleCardHeader = ({ children, className }) => (
    <div className={`px-6 py-4 border-b border-gray-200 ${className}`}> {/* Added border */}
        {children}
    </div>
);

const SimpleCardTitle = ({ children, className }) => (
    <h2 className={`text-lg font-semibold text-gray-800 ${className}`}> {/* Slightly smaller title for cards */}
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
        info: "bg-blue-100 text-blue-800", // Alias for default
        outline: "border border-gray-300 text-gray-700"
    };
    return (
        <span className={`${baseStyle} ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

const SimplePagination = ({ itemsPerPage, totalItems, currentPage, onPageChange }) => {
    const pageNumbers = [];
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    const handlePreviousClick = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNextClick = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

     // Only show pagination if there's more than one page or if total items exceeds one page
    if (totalPages <= 1 && totalItems <= itemsPerPage) return null;


    return (
        <nav className="flex justify-center mt-6">
            <ul className="inline-flex items-center -space-x-px">
                <li>
                    <button
                        onClick={handlePreviousClick}
                        disabled={currentPage === 1}
                        className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                </li>
                {pageNumbers.map(number => (
                    <li key={number}>
                        <button
                            onClick={() => onPageChange(number)}
                            className={`px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 ${currentPage === number ? 'bg-blue-500 text-white hover:bg-blue-600 hover:text-white' : ''}`}
                        >
                            {number}
                        </button>
                    </li>
                ))}
                <li>
                    <button
                        onClick={handleNextClick}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </li>
            </ul>
        </nav>
    );
};


export default function EventList() {
    const [allEvents, setAllEvents] = useState([]); // Stores all fetched events
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Added error state

    // Filter states
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [nodeIdFilter, setNodeIdFilter] = useState(''); // Filter by Node ID (string input)

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [eventsPerPage] = useState(10); // Number of events per page


    // Effect to fetch all events - runs once on component mount
    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            setError(null);
            setAllEvents([]); // Clear previous events
            try {
                const eventsData = await api.getAllEvents();
                 // Sort events by timestamp in descending order (most recent first)
                setAllEvents(eventsData.sort((a, b) => parseInt(b.event_timestamp) - parseInt(a.event_timestamp)));
            } catch (err) { // Changed error variable name
                console.error('Error fetching events:', err);
                setError("Failed to load events. Please try again.");
                setAllEvents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []); // Empty dependency array: runs once on mount


    // --- Filtering Logic (using useMemo) ---
    const filteredEvents = useMemo(() => {
        return allEvents.filter(event => {
            const typeMatch = typeFilter === 'all' || (event.event_type && event.event_type === typeFilter);
            const statusMatch = statusFilter === 'all' || (event.event_status && event.event_status === statusFilter);
            const nodeIdMatch = nodeIdFilter === '' || (event.node_id && event.node_id.includes(nodeIdFilter)); // Case-sensitive contains check

            return typeMatch && statusMatch && nodeIdMatch;
        });
    }, [allEvents, typeFilter, statusFilter, nodeIdFilter]); // Re-filter when allEvents or filter states change

    // --- Pagination Logic (using useMemo) ---
    const indexOfLastEvent = currentPage * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    const currentEvents = useMemo(() => {
        return filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
    }, [filteredEvents, indexOfFirstEvent, indexOfLastEvent]); // Re-slice when filteredEvents or pagination indices change

    const totalPages = useMemo(() => Math.ceil(filteredEvents.length / eventsPerPage), [filteredEvents.length, eventsPerPage]);

     // Effect to reset pagination to page 1 when filters change and current page is out of bounds
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
             setCurrentPage(1);
        } else if (filteredEvents.length > 0 && currentPage === 0) {
             setCurrentPage(1); // Handle case where filtered list becomes available
        } else if (filteredEvents.length === 0) {
             setCurrentPage(1); // Reset page if the filtered list becomes empty
        }
    }, [filteredEvents.length, totalPages, currentPage]); // Depend on filtered list length and total pages


    // --- Statistics Calculation (using useMemo) ---
    const overviewStats = useMemo(() => {
        const totalEvents = allEvents.length;
        const totalFilteredEvents = filteredEvents.length;

        const eventTypeCounts = filteredEvents.reduce((acc, event) => {
            const type = event.event_type || 'Unknown Type';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});

         const eventStatusCounts = filteredEvents.reduce((acc, event) => {
            const status = event.event_status || 'Unknown Status';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        return {
            totalEvents,
            totalFilteredEvents,
            eventTypeCounts,
            eventStatusCounts
        };
    }, [allEvents.length, filteredEvents]); // Recalculate when allEvents count or filteredEvents change

    // --- Get Unique Filter Options (using useMemo) ---
    const uniqueEventTypes = useMemo(() => {
        const types = new Set(allEvents.map(event => event.event_type).filter(Boolean));
        return ['all', ...Array.from(types)];
    }, [allEvents]);

    const uniqueEventStatuses = useMemo(() => {
        const statuses = new Set(allEvents.map(event => event.event_status).filter(Boolean));
        return ['all', ...Array.from(statuses)];
    }, [allEvents]);


    // --- Handlers (using useCallback) ---
    const handleFilterTypeChange = useCallback((event) => {
        setTypeFilter(event.target.value);
        // setCurrentPage(1); // Reset page is handled by useEffect
    }, []);

    const handleFilterStatusChange = useCallback((event) => {
        setStatusFilter(event.target.value);
        // setCurrentPage(1); // Reset page is handled by useEffect
    }, []);

     const handleNodeIdFilterChange = useCallback((event) => {
        setNodeIdFilter(event.target.value);
        // setCurrentPage(1); // Reset page is handled by useEffect
    }, []);


    const handlePageChange = useCallback((pageNumber) => {
        setCurrentPage(pageNumber);
    }, []);


    // --- Render Logic ---

    if (loading) {
        return <SimpleLoading />;
    }

    if (error) {
        return <SimpleErrorDisplay message={error} />;
    }

     // If data is loaded but there are no events at all
     if (allEvents.length === 0 && !loading) {
          return (
               <div className="container mx-auto p-6 text-center text-gray-600 bg-gray-50 rounded-md shadow">
                    <h2 className="text-xl font-semibold mb-2">No Events Found</h2>
                    <p>No event data is available to display.</p>
               </div>
          );
     }


    return (
        <div className="container mx-auto p-6 space-y-6 max-w-6xl bg-gray-50 min-h-screen"> {/* Added background and max-width */}
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Event History</h1> {/* Increased heading size */}

            {/* Overview Statistics Card */}
            <SimpleCard>
                <SimpleCardHeader>
                    <SimpleCardTitle>Event Overview</SimpleCardTitle>
                </SimpleCardHeader>
                <SimpleCardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500 font-medium">Total Events:</p>
                            <p className="font-semibold text-gray-800 text-lg">{overviewStats.totalEvents}</p>
                        </div>
                         <div>
                            <p className="text-gray-500 font-medium">Matching Filters:</p>
                            <p className="font-semibold text-gray-800 text-lg">{overviewStats.totalFilteredEvents}</p>
                        </div>
                    </div>
                     {Object.keys(overviewStats.eventTypeCounts).length > 0 && (
                         <div className="mt-4">
                              <p className="text-gray-500 font-medium mb-2">Event Type Breakdown (Filtered):</p>
                              <div className="flex flex-wrap gap-3">
                                  {Object.entries(overviewStats.eventTypeCounts).map(([type, count]) => (
                                      <SimpleBadge key={type} variant="outline" className="text-sm px-3 py-1">
                                          {type}: <span className="font-bold ml-1">{count}</span>
                                      </SimpleBadge>
                                  ))}
                              </div>
                         </div>
                     )}
                      {Object.keys(overviewStats.eventStatusCounts).length > 0 && (
                         <div className="mt-4">
                              <p className="text-gray-500 font-medium mb-2">Event Status Breakdown (Filtered):</p>
                              <div className="flex flex-wrap gap-3">
                                  {Object.entries(overviewStats.eventStatusCounts).map(([status, count]) => (
                                      <SimpleBadge key={status} variant="outline" className="text-sm px-3 py-1">
                                          {status}: <span className="font-bold ml-1">{count}</span>
                                      </SimpleBadge>
                                  ))}
                              </div>
                         </div>
                     )}
                </SimpleCardContent>
            </SimpleCard>


            {/* Filters Card */}
            <SimpleCard>
                 <SimpleCardHeader>
                     <SimpleCardTitle>Filter Events</SimpleCardTitle>
                 </SimpleCardHeader>
                 <SimpleCardContent>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                         {/* Type Filter */}
                         <div>
                             <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                             <select
                                 id="type-filter"
                                 className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                 value={typeFilter}
                                 onChange={handleFilterTypeChange}
                             >
                                 {uniqueEventTypes.map(type => (
                                     <option key={type} value={type}>
                                         {type === 'all' ? 'All Types' : type}
                                     </option>
                                 ))}
                             </select>
                         </div>
                         {/* Status Filter */}
                         <div>
                             <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Event Status</label>
                             <select
                                 id="status-filter"
                                 className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                 value={statusFilter}
                                 onChange={handleFilterStatusChange}
                             >
                                 {uniqueEventStatuses.map(status => (
                                     <option key={status} value={status}>
                                         {status === 'all' ? 'All Statuses' : status}
                                     </option>
                                 ))}
                             </select>
                         </div>
                          {/* Node ID Filter */}
                         <div>
                             <label htmlFor="nodeid-filter" className="block text-sm font-medium text-gray-700 mb-1">Node ID</label>
                             <input
                                 type="text"
                                 id="nodeid-filter"
                                 className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                 value={nodeIdFilter}
                                 onChange={handleNodeIdFilterChange}
                                 placeholder="Enter Node ID..."
                             />
                         </div>
                     </div>
                 </SimpleCardContent>
            </SimpleCard>


            {/* Event List Card */}
            <SimpleCard>
                <SimpleCardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                     <SimpleCardTitle>Events ({overviewStats.totalFilteredEvents}{overviewStats.totalFilteredEvents !== overviewStats.totalEvents ? ` of ${overviewStats.totalEvents}` : ''})</SimpleCardTitle>
                     {/* Pagination at the top */}
                     {filteredEvents.length > 0 && (
                         <SimplePagination
                            itemsPerPage={eventsPerPage}
                            totalItems={filteredEvents.length}
                            currentPage={currentPage}
                            onPageChange={handlePageChange}
                         />
                     )}
                </SimpleCardHeader>

                <SimpleCardContent className="p-0"> {/* Remove content padding as list items have their own */}
                    {currentEvents.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                            {currentEvents.map((event) => (
                                <div key={event.event_id} className="p-6 hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                                    <div className="flex flex-col space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                {/* Link to Node Details */}
                                                <Link
                                                    href={`/node/${event.node_id}`}
                                                    className="text-blue-600 hover:underline font-medium text-sm" // Smaller font for Node ID link
                                                >
                                                    Node ID: {event.node_id || 'N/A'}
                                                </Link>
                                                <h3 className="text-lg font-semibold text-gray-800 mt-1">{event.event_type || 'Unknown Event Type'}</h3> {/* Increased heading size */}
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
                                                    format(new Date(parseInt(event.event_timestamp) * 1000), 'MMM dd,yyyy HH:mm:ss') // Added Year
                                                    : 'Timestamp N/A'
                                                }
                                            </div>
                                        </div>
                                        {event.image && (
                                            <div className="mt-4 flex justify-center"> {/* Added margin-top */}
                                                {/* Basic image handling, consider lazy loading for many images */}
                                                <img
                                                    src={`data:image/jpeg;base64,${event.image}`}
                                                    alt={`Image for ${event.event_type || 'an event'}`}
                                                    className="rounded-lg max-h-80 w-auto border border-gray-200 shadow-sm object-contain"
                                                    loading="lazy" // Added lazy loading
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
                                                Location: {event.latitude != null && event.longitude != null ? `${event.latitude}, ${event.longitude}` : 'Location Unknown'}
                                            </div>
                                        )}
                                         {/* Add more event specific details if available */}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="p-6 text-center text-gray-500">
                            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md" role="alert">
                                <p className="font-bold">No Events Found</p>
                                <p className="text-sm">No events match the current filter criteria.</p>
                            </div>
                         </div>
                    )}
                </SimpleCardContent>
                 {/* Pagination at the bottom */}
                 {filteredEvents.length > 0 && (
                     <div className="p-6 border-t border-gray-200"> {/* Add padding and border */}
                         <SimplePagination
                            itemsPerPage={eventsPerPage}
                            totalItems={filteredEvents.length}
                            currentPage={currentPage}
                            onPageChange={handlePageChange}
                         />
                     </div>
                  )}
            </SimpleCard>
        </div>
    );
}