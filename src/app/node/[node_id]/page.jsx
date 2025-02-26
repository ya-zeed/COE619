'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { format } from 'date-fns';
import { useParams } from 'next/navigation';
import { Loading } from '@/components/loading';

export default function NodeDetails() {
    const [node, setNode] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const params = useParams();

    useEffect(() => {
        const fetchNodeData = async () => {
            if (!params?.node_id) return;
            try {
                const nodeId = await params.node_id;
                const [nodeData, eventsData] = await Promise.all([
                    api.getNode(nodeId),
                    api.getNodeEvents(nodeId)
                ]);
                setNode(nodeData);
                setEvents(eventsData);
            } catch (error) {
                console.error('Error fetching node data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchNodeData();
    }, [params?.node_id]);

    if (loading) {
        return <Loading />
    }

    if (!node) {
        return <div>Node not found</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Node Details Card */}
            <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold mb-4">{node.node_name}</h1>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-gray-600">Status</p>
                        <p className="font-semibold">{node.node_status}</p>
                    </div>
                    <div>
                        <p className="text-gray-600">Location</p>
                        <p className="font-semibold">{node.latitude}, {node.longitude}</p>
                    </div>
                </div>
            </div>

            {/* Events List */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Event History</h2>
                </div>
                <div className="divide-y">
                    {events.map((event) => (
                        <div key={event.event_id} className="p-6 hover:bg-gray-50">
                            <div className="flex flex-col space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold">{event.event_type}</h3>
                                        <p className="text-gray-600">{event.description}</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Status: <span className="font-medium">{event.event_status}</span>
                                        </p>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {format(new Date(parseInt(event.event_timestamp) * 1000), 'PPp')}
                                    </div>
                                </div>
                                {event.image && (
                                    <div className="mt-2">
                                        <img 
                                            src={`data:image/jpeg;base64,${event.image}`}
                                            alt={event.event_type}
                                            className="rounded-lg max-h-64 w-auto"
                                        />
                                    </div>
                                )}
                                {event.event_details && (
                                    <div className="text-sm text-gray-600">
                                        <p>{event.event_details}</p>
                                    </div>
                                )}
                                <div className="text-sm text-gray-500">
                                    <p>Location: {event.latitude}, {event.longitude}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {events.length === 0 && (
                        <div className="p-6 text-center text-gray-500">
                            No events found for this node
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
