"use client"
import { PieChart, Pie, Tooltip, Legend, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

export function PieChartComponent({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pie Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <PieChart width={300} height={300}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </CardContent>
    </Card>
  )
}