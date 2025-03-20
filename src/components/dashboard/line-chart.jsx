"use client"
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function LineChartComponent({ data }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Line Chart</CardTitle>
            </CardHeader>
            <CardContent>
                <LineChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="events" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
            </CardContent>
        </Card>
    )
}
