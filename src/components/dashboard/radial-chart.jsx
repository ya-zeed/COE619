"use client"
import { RadialBarChart, RadialBar, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RadialBarChartComponent({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Radial Bar Chart - Events Per Node</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="10%"
            outerRadius="80%"
            data={data}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar
              minAngle={15}
              label={{ position: 'insideStart', fill: '#fff' }}
              background
              clockWise
              dataKey="events"
            />
            <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
            <Tooltip />
          </RadialBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
