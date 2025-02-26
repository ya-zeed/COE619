'use client'

import { BarChartComponent } from "@/components/dashboard/bar-chart"
import { Counter } from "@/components/dashboard/counter"
import { NodesTable } from "@/components/dashboard/nodes-table"
import api from "@/lib/api"
import { DashboardMap } from "@/components/dashboard/map"
import { useState, useEffect } from 'react';

export default function Page() {
  const chartData = [
    { month: "January", events: 186 },
    { month: "February", events: 305 },
    { month: "March", events: 237 },
    { month: "April", events: 73 },
    { month: "May", events: 209 },
  ];

  const [nodesData, setNodesData] = useState([]);
  const [eventsData, setEventsData] = useState([]);

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
      }
    };
    fetchData();
  }, []);

  const chartConfig = {
    events: {
      label: "events",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50">
          <BarChartComponent
            data={chartData}
            config={chartConfig} />
        </div>
        <div className="aspect-video rounded-xl bg-muted/50">
          <Counter label="Total Events" count={eventsData.length} />
        </div>
        <div className="aspect-video rounded-xl bg-muted/50">
          <DashboardMap nodes={nodesData} />
        </div>
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <NodesTable data={nodesData} />
      </div>
    </div>
  );
}
