'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { NodePalette } from './node-palette';
import { NodeConfigPanel } from './node-config-panel';
import { WorkflowToolbar } from './workflow-toolbar';
import { CustomNode } from './custom-node';
import { 
  Save, 
  Play, 
  ArrowLeft, 
  Settings, 
  Zap,
  Database,
  Mail,
  Globe,
  Webhook,
  Calculator
} from 'lucide-react';

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    position: { x: 250, y: 50 },
    data: { 
      label: 'Trigger',
      type: 'trigger',
      icon: Zap,
      color: 'green',
      description: 'Start your workflow'
    },
  },
];

const initialEdges: Edge[] = [];

interface WorkflowBuilderProps {
  workflowId?: string;
}

export function WorkflowBuilder({ workflowId }: WorkflowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  
  const router = useRouter();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const nodeData = event.dataTransfer.getData('application/reactflow');

      if (typeof nodeData === 'undefined' || !nodeData || !reactFlowBounds || !reactFlowInstance) {
        return;
      }

      const { type, label, icon, color, description } = JSON.parse(nodeData);
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: `${type}_${Date.now()}`,
        type: 'custom',
        position,
        data: { 
          label, 
          type, 
          icon: eval(icon), // In a real app, you'd handle this more safely
          color,
          description
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const handleSave = async () => {
    setIsAutoSaving(true);
    // Simulate save
    setTimeout(() => {
      setIsAutoSaving(false);
      console.log('Workflow saved:', { nodes, edges, name: workflowName });
    }, 1000);
  };

  const handleRun = () => {
    console.log('Running workflow:', { nodes, edges, name: workflowName });
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleBack} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <Input
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="text-xl font-semibold border-none bg-transparent p-0 h-auto focus-visible:ring-0"
                placeholder="Enter workflow name"
              />
              <p className="text-sm text-gray-500 mt-1">
                {workflowId ? 'Editing workflow' : 'Creating new workflow'}
              </p>
            </div>
            {isAutoSaving && (
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                Auto-saving...
              </Badge>
            )}
          </div>
          
          <WorkflowToolbar onSave={handleSave} onRun={handleRun} />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Node Palette */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <NodePalette />
        </div>

        {/* Main Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              className="bg-gray-50"
            >
              <Controls />
              <MiniMap 
                className="!bg-white !border !border-gray-200"
                nodeColor={(node) => {
                  switch (node.data?.color) {
                    case 'green': return '#10b981';
                    case 'blue': return '#3b82f6';
                    case 'purple': return '#8b5cf6';
                    case 'orange': return '#f97316';
                    case 'red': return '#ef4444';
                    default: return '#6b7280';
                  }
                }}
              />
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
            </ReactFlow>
          </ReactFlowProvider>
        </div>

        {/* Configuration Panel */}
        {selectedNode && (
          <div className="w-96 bg-white border-l border-gray-200">
            <NodeConfigPanel 
              node={selectedNode} 
              onClose={() => setSelectedNode(null)}
              onUpdate={(updatedNode) => {
                setNodes((nds) =>
                  nds.map((node) =>
                    node.id === updatedNode.id ? updatedNode : node
                  )
                );
                setSelectedNode(updatedNode);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}