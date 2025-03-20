"use client"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ScatterChartComponent({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scatter Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid />
            <XAxis type="number" dataKey="x" name="X" />
            <YAxis type="number" dataKey="y" name="Y" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            <Scatter name="Data Points" data={data} fill="var(--color-events)" />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}