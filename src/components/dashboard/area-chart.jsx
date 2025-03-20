"use client"
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function AreaChartComponent({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Area Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="events" stroke="var(--color-events)" fill="var(--color-events-light)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}