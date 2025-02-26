'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { format } from 'date-fns';
import { Loading } from '@/components/loading';
import Link from 'next/link';

export default function EventList() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const eventsData = await api.getAllEvents();
                setEvents(eventsData);
            } catch (error) {
                console.error('Error fetching events:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">All Events</h1>
            
            <div className="bg-white rounded-lg shadow divide-y">
                {events.map((event) => (
                    <div key={event.event_id} className="p-6 hover:bg-gray-50">
                        <div className="flex flex-col space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Link 
                                        href={`/node/${event.edge_node_id}`}
                                        className="text-blue-600 hover:underline font-medium"
                                    >
                                        Node ID: {event.edge_node_id}
                                    </Link>
                                    <h3 className="font-semibold mt-2">{event.event_type}</h3>
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
                        No events found
                    </div>
                )}
            </div>
        </div>
    );
}
