"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

export function Counter({ label, count }) {
  const [currentCount, setCurrentCount] = useState(0)

  useEffect(() => {
    const step = Math.ceil(count / 50)
    const interval = setInterval(() => {
      setCurrentCount(prev => {
        if (prev + step >= count) {
          clearInterval(interval)
          return count
        }
        return prev + step
      })
    }, 20)

    return () => clearInterval(interval)
  }, [count])

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 py-10">
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-5xl font-bold">{currentCount}</p>
          <p className="text-base text-muted-foreground mt-2">Total Events</p>
        </div>
      </CardContent>
    </Card>
  );
};
