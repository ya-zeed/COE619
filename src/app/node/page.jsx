'use client';
import api from '@/lib/api';
import { DashboardMap } from "@/components/dashboard/map";
import { useState, useEffect } from 'react';
import { Loading } from '@/components/loading';
export default function NodeList() {
  const [nodes, setNodes] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const data = await api.getAllNodes();
        setNodes(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching nodes:', error);
        setLoading(false);
      }
    };
    fetchNodes();
  }, []);

  if (loading) {
    return <Loading />
  }

  return (
    <div className="space-y-4">
      <div className="aspect-video rounded-lg overflow-hidden">
        <div className="h-[50vh]">
          <DashboardMap
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onMarkerClick={(nodeId) => setSelectedNodeId(nodeId)}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3 mt-4">
          {nodes.map((node) => (
            <div
              key={node.node_id}
              className={`flex flex-col border p-4 rounded-lg cursor-pointer ${selectedNodeId === node.node_id ? 'bg-green-100' : 'bg-muted/50'
                }`}
              onClick={() => setSelectedNodeId(node.node_id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{node.node_name}</h2>
                  <p className="text-gray-600 mb-4">{node.node_status}</p>
                </div>
                <a
                  href={`/node/${node.node_id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}