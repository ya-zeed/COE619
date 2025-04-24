'use client'

import { BarChartComponent } from "@/components/dashboard/bar-chart"
import { NodesTable } from "@/components/dashboard/nodes-table"
import api from "@/lib/api"
import { DashboardMap } from "@/components/dashboard/map"
import { useState, useEffect } from 'react';
import { NodeEventsChart } from "@/components/dashboard/node-events-chart"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Activity, AlertCircle, Clock, List, MapPin, Server } from "lucide-react"
import pusher from "@/lib/pusher"

export default function Page() {
  const [nodesData, setNodesData] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nodes, events] = await Promise.all([
          api.getAllNodes(),
          api.getAllEvents()
        ]);
        setNodesData(nodes);
        setEventsData(events);
      } catch (error) {
        console.error('Error fetching data:', error);
        setNodesData([]);
        setEventsData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Subscribe to Pusher channels
    const eventsChannel = pusher.subscribe('events');

    // Listen for new events
    eventsChannel.bind('new-event', async (data) => {
      const [nodes, events] = await Promise.all([
        api.getAllNodes(),
        api.getAllEvents()
      ]);
      setNodesData(nodes);
      setEventsData(events);
    });

    // Cleanup subscription on component unmount
    return () => {
      eventsChannel.unsubscribe();
    };
  }, []);

  function getEventsPerNode() {
    return nodesData.map(node => {
      const count = eventsData.filter(event => event.node_id === node.node_id).length;
      return { nodeName: node.name || node.id, events: count };
    });
  }

  function groupEventsByMonth() {
    const monthMap = {};
    eventsData.forEach(event => {
      if (event.event_timestamp) {
        const date = new Date(event.event_timestamp * 1000);
        const month = date.toLocaleString('default', { month: 'short' });
        monthMap[month] = (monthMap[month] || 0) + 1;
      }
    });
    return Object.keys(monthMap).map(month => ({ month, events: monthMap[month] }));
  }

  function getNodeEventsData() {
    const eventsPerNode = getEventsPerNode();
    const maxCount = Math.max(...eventsPerNode.map(item => item.events)) || 1;
    return eventsPerNode.map(item => ({
      subject: item.nodeName,
      A: item.events,
      Relative: Math.round((item.events / maxCount) * 100)
    }));
  }

  function getCumulativeEventsByMonth() {
    const grouped = groupEventsByMonth(eventsData);
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    grouped.sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));
    let cumulative = 0;
    return grouped.map(item => {
      cumulative += item.events;
      return { month: item.month, events: cumulative };
    });
  }

  const eventsPerMonth = groupEventsByMonth();
  const areaChartData = getCumulativeEventsByMonth();
  const nodeEventsData = getNodeEventsData();
  

  const activeNodes = nodesData.filter(node => node.node_status === 'online').length;
  const totalNodes = nodesData.length;
  const recentEvents = eventsData.slice(-5).reverse();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventsData.length}</div>
            <p className="text-xs text-muted-foreground">
              {eventsData.length > 0 ? 
                `Last event: ${new Date(eventsData[eventsData.length - 1].event_timestamp * 1000).toLocaleString()}` : 
                'No events recorded'
              }
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Nodes</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeNodes}/{totalNodes}</div>
            <p className="text-xs text-muted-foreground">+2 new nodes this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Event Types</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(eventsData.map(event => event.event_type)).size}</div>
            <p className="text-xs text-muted-foreground">
              {eventsData.length > 0 ? 
                `Unique event types recorded` : 
                'No event types recorded'
              }
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventsData.filter(event => {
              const eventDate = new Date(event.event_timestamp * 1000);
              const today = new Date();
              return eventDate.toDateString() === today.toDateString();
            }).length}</div>
            <p className="text-xs text-muted-foreground">Events recorded today</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Events Overview</CardTitle>
            <CardDescription>Monthly event distribution and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChartComponent data={eventsPerMonth} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Node Events Distribution</CardTitle>
            <CardDescription>Event count per node</CardDescription>
          </CardHeader>
          <CardContent>
            <NodeEventsChart data={nodeEventsData} />
          </CardContent>
        </Card>
      </div>

      {/* Map and Recent Events */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Node Locations</CardTitle>
            <CardDescription>Real-time node status and locations</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <DashboardMap nodes={nodesData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>Latest events from all nodes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-center space-x-4">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.node_id}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.event_timestamp * 1000).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {event.event_type}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Nodes Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Nodes</CardTitle>
          <CardDescription>Detailed information about all nodes</CardDescription>
        </CardHeader>
        <CardContent>
          <NodesTable data={nodesData} />
        </CardContent>
      </Card>
    </div>
  );
}
