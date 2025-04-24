'use client';
import api from '@/lib/api'; // Assuming '@/lib/api' exists and works
import { DashboardMap } from "@/components/dashboard/map"; // Assuming this component exists and works
import { useState, useEffect } from 'react'; // Removed useMemo, useCallback

// --- Simple UI Components (using Tailwind CSS) ---

const SimpleLoading = () => (
    <div className="flex flex-col justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-50 mb-4"></div>
        <p className="text-xl text-gray-600">Loading nodes...</p>
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

    if (totalPages <= 1 && totalItems <= itemsPerPage) return null; // Don't show pagination if only one page or less items than per page

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


// --- Main Component ---

export default function NodeList() {
    // State declarations must be at the top level, unconditionally
    const [allNodes, setAllNodes] = useState([]); // Stores all fetched nodes
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // State to handle errors

    // Filter states
    const [statusFilter, setStatusFilter] = useState('all'); // Filter by node status

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [nodesPerPage] = useState(9); // Items per page (e.g., for a 3x3 grid)


    // Effect to fetch nodes - runs once on mount
    useEffect(() => {
        const fetchNodes = async () => {
            setLoading(true);
            setError(null);
            setAllNodes([]); // Clear previous nodes
            try {
                const data = await api.getAllNodes();
                setAllNodes(data);
            } catch (err) {
                console.error('Error fetching nodes:', err);
                setError("Failed to load nodes. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchNodes();
    }, []); // Empty dependency array ensures this runs only once


    // --- Filtering Logic ---
    // Calculate filtered nodes list on every render
    const filteredNodes = allNodes.filter(node => {
        if (statusFilter === 'all') {
            return true;
        }
        // Ensure node.node_status is not null or undefined before comparison
        return node.node_status && node.node_status === statusFilter;
    });

    // --- Pagination Logic ---
    // Recalculate total pages on every render
    const totalPages = Math.ceil(filteredNodes.length / nodesPerPage);

    // Effect to reset pagination to page 1 when filters change and current page is out of bounds
    // This still uses useEffect to manage the side effect of state update based on other state
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
             setCurrentPage(1);
        } else if (filteredNodes.length > 0 && currentPage === 0) {
             // Handle case where filteredNodes become available after being empty
             setCurrentPage(1);
        } else if (filteredNodes.length === 0) {
             // If filters result in no nodes, reset to page 1 (or keep as is, depending on desired UX)
             setCurrentPage(1);
        }
         // Include dependencies that could cause the current page to become invalid
    }, [filteredNodes.length, totalPages, currentPage]);


    // Calculate the nodes to display on the current page on every render
    const indexOfLastNode = currentPage * nodesPerPage;
    const indexOfFirstNode = indexOfLastNode - nodesPerPage;
    const currentNodes = filteredNodes.slice(indexOfFirstNode, indexOfLastNode);


    // --- Stats Calculation ---
    // Calculate stats on every render
    const totalNodes = allNodes.length; // Stats based on ALL fetched nodes
    const statusCounts = allNodes.reduce((acc, node) => {
        const status = node.node_status || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});
    const totalFilteredNodes = filteredNodes.length; // Stat for filtered nodes

    const nodeStats = {
        totalNodes,
        statusCounts,
        totalFilteredNodes,
    };

    // --- Handlers ---
    // Function definitions recreated on every render
    const handleStatusFilterChange = (event) => {
        setStatusFilter(event.target.value);
        // setCurrentPage(1); // Reset to first page is handled by useEffect now
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleNodeCardClick = (nodeId) => {
        setSelectedNodeId(nodeId);
        // Optionally scroll the map into view or highlight the marker
    };

     const handleMapMarkerClick = (nodeId) => {
        setSelectedNodeId(nodeId);
        // Optionally scroll the corresponding card into view
        const cardElement = document.getElementById(`node-card-${nodeId}`);
        if (cardElement) {
            cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };


    if (loading) {
        return <SimpleLoading />;
    }

    if (error) {
        return <SimpleErrorDisplay message={error} />;
    }

     // Extract unique statuses for the filter dropdown from all nodes on every render
    const uniqueStatuses = ['all', ...new Set(allNodes.map(node => node.node_status).filter(Boolean))];


    return (
        <div className="container mx-auto p-6 space-y-6 max-w-7xl"> {/* Adjusted max-width */}
             {/* Node Statistics */}
             {allNodes.length > 0 && ( // Only show stats if there are any nodes
                <SimpleCard>
                    <SimpleCardHeader>
                        <SimpleCardTitle>Network Overview</SimpleCardTitle>
                    </SimpleCardHeader>
                    <SimpleCardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500 font-medium">Total Nodes:</p>
                                <p className="font-semibold text-gray-700 text-lg">{nodeStats.totalNodes}</p>
                            </div>
                            {Object.entries(nodeStats.statusCounts).map(([status, count]) => (
                                <div key={status}>
                                    <p className="text-gray-500 font-medium">{status} Nodes:</p>
                                    <SimpleBadge variant={status === 'online' ? 'success' : status === 'offline' ? 'secondary' : 'warning'} className="text-lg px-3 py-1">{count}</SimpleBadge>
                                </div>
                            ))}
                        </div>
                    </SimpleCardContent>
                </SimpleCard>
             )}


            {/* Map Section */}
            <SimpleCard className="overflow-hidden">
                <SimpleCardContent className="p-0"> {/* No padding if map fills card */}
                     <div className="h-[60vh] min-h-[400px] w-full"> {/* Increased map height */}
                        <DashboardMap
                            nodes={allNodes} // Pass all nodes to the map
                            selectedNodeId={selectedNodeId}
                            onMarkerClick={handleMapMarkerClick} // Pass the function definition
                        />
                    </div>
                </SimpleCardContent>
            </SimpleCard>

            {/* Node List with Filters and Pagination */}
            <SimpleCard>
                 <SimpleCardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <SimpleCardTitle className="text-2xl">Nodes ({nodeStats.totalFilteredNodes}{nodeStats.totalFilteredNodes !== nodeStats.totalNodes ? ` of ${nodeStats.totalNodes}` : ''})</SimpleCardTitle> {/* Updated title to show filtered count */}
                    {/* Filters */}
                    <div className="flex items-center gap-4 text-sm text-gray-700">
                        <label htmlFor="status-filter" className="font-medium">Status:</label>
                        <select
                            id="status-filter"
                            className="border border-gray-300 rounded-md p-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                            value={statusFilter}
                            onChange={handleStatusFilterChange} // Pass the function definition
                        >
                            {uniqueStatuses.map(status => (
                                <option key={status} value={status}>
                                    {status === 'all' ? 'All Statuses' : status}
                                </option>
                            ))}
                        </select>
                    </div>
                 </SimpleCardHeader>
                <SimpleCardContent>
                     {currentNodes.length === 0 && filteredNodes.length === 0 && ( // Check if filtered list is also empty
                         <div className="text-center text-gray-500 py-8">
                             No nodes found matching the selected filters.
                         </div>
                     )}
                      {currentNodes.length === 0 && filteredNodes.length > 0 && ( // Check if current page is empty but there are filtered nodes (shouldn't happen with correct pagination)
                         <div className="text-center text-gray-500 py-8">
                            No nodes on this page. Please go back to a previous page.
                         </div>
                      )}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"> {/* Increased gap */}
                        {currentNodes.map((node) => (
                            <div
                                key={node.node_id}
                                id={`node-card-${node.node_id}`} // Add ID for scrolling
                                className={`flex flex-col border rounded-lg cursor-pointer p-4 transition-all duration-200 ease-in-out
                                    ${selectedNodeId === node.node_id
                                        ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm'
                                    }`}
                                onClick={() => handleNodeCardClick(node.node_id)} // Pass the function definition
                            >
                                <div className="flex justify-between items-start mb-3"> {/* Adjusted spacing */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">{node.node_name || `Node ${node.node_id}`}</h3> {/* Changed to h3, added fallback name */}
                                        {node.node_status && (
                                            <SimpleBadge variant={node.node_status === 'online' ? 'success' : node.node_status === 'offline' ? 'secondary' : 'warning'} className="mt-1">
                                                {node.node_status}
                                            </SimpleBadge>
                                        )}
                                    </div>
                                     {/* View Details Link/Icon */}
                                    <a
                                        href={`/node/${node.node_id}`}
                                        onClick={(e) => e.stopPropagation()} // Prevent card click when clicking link
                                        className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-150"
                                        title={`View details for ${node.node_name || node.node_id}`} // Add tooltip
                                    >
                                        {/* Simple Eye Icon (replace with your icon component if available) */}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye text-gray-600"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                    </a>
                                </div>
                                {/* Add more node details if available and relevant for the list view */}
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p><span className="font-medium">ID:</span> {node.node_id}</p>
                                     {node.latitude != null && node.longitude != null && (
                                        <p><span className="font-medium">Location:</span> {node.latitude}, {node.longitude}</p>
                                     )}
                                     {/* Example of other potential fields */}
                                     {/* {node.last_seen && <p><span className="font-medium">Last Seen:</span> {format(new Date(node.last_seen), 'PP')}</p>} */}
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Pagination */}
                     {filteredNodes.length > 0 && ( // Only show pagination if there are filtered nodes to paginate
                        <SimplePagination
                            itemsPerPage={nodesPerPage}
                            totalItems={filteredNodes.length}
                            currentPage={currentPage}
                            onPageChange={handlePageChange} // Pass the function definition
                        />
                     )}
                </SimpleCardContent>
            </SimpleCard>
        </div>
    );
}