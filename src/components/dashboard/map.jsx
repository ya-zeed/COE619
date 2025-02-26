'use client'

import dynamic from 'next/dynamic';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Move ALL map-related imports and code into the MapComponent
const MapComponent = dynamic(() => import('./map-component'), {
  ssr: false,
});

// Update the exported component to use the dynamic import
export function DashboardMap({ nodes, selectedNodeId, onMarkerClick }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle><a href="/node" className="hover:underline">Location Map</a></CardTitle>
      </CardHeader>
      <CardContent className="flex-1 relative">
        <div className="absolute inset-0 p-4">
          <MapComponent nodes={nodes} selectedNodeId={selectedNodeId} onMarkerClick={onMarkerClick} />
        </div>
      </CardContent>
    </Card>
  );
}
