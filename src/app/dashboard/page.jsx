'use client'

import { BarChartComponent } from "@/components/dashboard/bar-chart"
import { NodesTable } from "@/components/dashboard/nodes-table"
import api from "@/lib/api"
import { DashboardMap } from "@/components/dashboard/map"
import { useState, useEffect } from 'react';
import { AreaChartComponent } from "@/components/dashboard/area-chart"
import { RadarChartComponent } from "@/components/dashboard/radar-chart"
import { ScatterChartComponent } from "@/components/dashboard/scatter-chart"
import { RadialBarChart } from "recharts"
import { RadialBarChartComponent } from "@/components/dashboard/radial-chart"
import { Counter } from "@/components/dashboard/counter"

export default function Page() {
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

  function getEventsPerNode() {
    return nodesData.map(node => {
      const count = eventsData.filter(event => event.node_id === node.id).length;
      return { nodeName: node.name || node.id, events: count };
    });
  }

  function groupEventsByMonth() {
    const monthMap = {};
    eventsData.forEach(event => {
      if (event.event_timestamp) {
        const date = new Date(event.event_timestamp * 1000);
        // Get abbreviated month name, e.g., "Jan"
        const month = date.toLocaleString('default', { month: 'short' });
        monthMap[month] = (monthMap[month] || 0) + 1;
      }
    });
    return Object.keys(monthMap).map(month => ({ month, events: monthMap[month] }));
  }

  function getRadarData() {
    const eventsPerNode = getEventsPerNode(nodesData, eventsData);
    const maxCount = Math.max(...eventsPerNode.map(item => item.events)) || 1;
    return eventsPerNode.map(item => ({
      subject: item.nodeName,
      EventCount: item.events,
      // "Relative" is expressed as a percentage of the maximum event count
      Relative: Math.round((item.events / maxCount) * 100)
    }));
  }

  function getCumulativeEventsByMonth() {
    const grouped = groupEventsByMonth(eventsData);
    // Ensure months are sorted in calendar order
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
  const radarChartData = getRadarData();
  const eventsPerNode = getEventsPerNode()


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
            data={eventsPerMonth}
            config={chartConfig} />
        </div>
        <div className="aspect-video rounded-xl bg-muted/50">
          <Counter count={eventsData.length} />
        </div>
        <div className="aspect-video rounded-xl bg-muted/50">
          <DashboardMap nodes={nodesData} />
        </div>
      </div>
      <div className="grid auto-rows-min gap-4 md:grid-cols-2">
        <div className="aspect-video rounded-xl bg-muted/50">
          <AreaChartComponent data={areaChartData} />
        </div>
        <div className="aspect-video rounded-xl bg-muted/50">
          <RadarChartComponent data={radarChartData} />
        </div>
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <NodesTable data={nodesData} />
      </div>
    </div>
  );
}
