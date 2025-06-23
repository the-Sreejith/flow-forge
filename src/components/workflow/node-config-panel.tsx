'use client';

import { useState } from 'react';
import { Node } from 'reactflow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { X, Settings, Code, Database, Mail, Globe } from 'lucide-react';

interface NodeConfigPanelProps {
  node: Node;
  onClose: () => void;
  onUpdate: (node: Node) => void;
}

export function NodeConfigPanel({ node, onClose, onUpdate }: NodeConfigPanelProps) {
  const [nodeData, setNodeData] = useState(node.data);
  const [nodeName, setNodeName] = useState(node.data.label || '');

  const handleSave = () => {
    const updatedNode = {
      ...node,
      data: {
        ...nodeData,
        label: nodeName
      }
    };
    onUpdate(updatedNode);
  };

  const renderConfigFields = () => {
    switch (node.data.type) {
      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="to">To</Label>
              <Input 
                id="to" 
                placeholder="recipient@example.com"
                value={nodeData.to || ''}
                onChange={(e) => setNodeData({...nodeData, to: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                placeholder="Email subject"
                value={nodeData.subject || ''}
                onChange={(e) => setNodeData({...nodeData, subject: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="body">Body</Label>
              <Textarea 
                id="body" 
                placeholder="Email content"
                value={nodeData.body || ''}
                onChange={(e) => setNodeData({...nodeData, body: e.target.value})}
                rows={4}
              />
            </div>
          </div>
        );
      
      case 'http_request':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="method">Method</Label>
              <Select 
                value={nodeData.method || 'GET'}
                onValueChange={(value) => setNodeData({...nodeData, method: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="url">URL</Label>
              <Input 
                id="url" 
                placeholder="https://api.example.com/endpoint"
                value={nodeData.url || ''}
                onChange={(e) => setNodeData({...nodeData, url: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="headers">Headers (JSON)</Label>
              <Textarea 
                id="headers" 
                placeholder='{"Content-Type": "application/json"}'
                value={nodeData.headers || ''}
                onChange={(e) => setNodeData({...nodeData, headers: e.target.value})}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="body">Body</Label>
              <Textarea 
                id="body" 
                placeholder="Request body"
                value={nodeData.requestBody || ''}
                onChange={(e) => setNodeData({...nodeData, requestBody: e.target.value})}
                rows={4}
              />
            </div>
          </div>
        );
      
      case 'database':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="operation">Operation</Label>
              <Select 
                value={nodeData.operation || 'SELECT'}
                onValueChange={(value) => setNodeData({...nodeData, operation: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SELECT">SELECT</SelectItem>
                  <SelectItem value="INSERT">INSERT</SelectItem>
                  <SelectItem value="UPDATE">UPDATE</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="table">Table</Label>
              <Input 
                id="table" 
                placeholder="table_name"
                value={nodeData.table || ''}
                onChange={(e) => setNodeData({...nodeData, table: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="query">SQL Query</Label>
              <Textarea 
                id="query" 
                placeholder="SELECT * FROM table_name WHERE..."
                value={nodeData.query || ''}
                onChange={(e) => setNodeData({...nodeData, query: e.target.value})}
                rows={4}
              />
            </div>
          </div>
        );
      
      case 'condition':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="condition">Condition</Label>
              <Input 
                id="condition" 
                placeholder="{{input.value}} > 100"
                value={nodeData.condition || ''}
                onChange={(e) => setNodeData({...nodeData, condition: e.target.value})}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="continue-on-fail"
                checked={nodeData.continueOnFail || false}
                onCheckedChange={(checked) => setNodeData({...nodeData, continueOnFail: checked})}
              />
              <Label htmlFor="continue-on-fail">Continue on fail</Label>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Node description"
                value={nodeData.description || ''}
                onChange={(e) => setNodeData({...nodeData, description: e.target.value})}
                rows={3}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              {node.data.icon && <node.data.icon className="h-5 w-5 text-gray-600" />}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Configure Node</h3>
              <Badge variant="outline" className="mt-1">
                {node.data.type}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="settings" className="h-full">
          <TabsList className="grid w-full grid-cols-2 m-4 mb-0">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings" className="p-4 space-y-6">
            <div>
              <Label htmlFor="node-name">Node Name</Label>
              <Input 
                id="node-name"
                value={nodeName}
                onChange={(e) => setNodeName(e.target.value)}
                placeholder="Enter node name"
              />
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Configuration</h4>
              {renderConfigFields()}
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="p-4 space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Advanced Settings</h4>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="retry-on-fail"
                    checked={nodeData.retryOnFail || false}
                    onCheckedChange={(checked) => setNodeData({...nodeData, retryOnFail: checked})}
                  />
                  <Label htmlFor="retry-on-fail">Retry on failure</Label>
                </div>
                
                <div>
                  <Label htmlFor="retry-count">Retry Count</Label>
                  <Input 
                    id="retry-count"
                    type="number"
                    value={nodeData.retryCount || 3}
                    onChange={(e) => setNodeData({...nodeData, retryCount: parseInt(e.target.value)})}
                    min={1}
                    max={10}
                  />
                </div>
                
                <div>
                  <Label htmlFor="timeout">Timeout (seconds)</Label>
                  <Input 
                    id="timeout"
                    type="number"
                    value={nodeData.timeout || 30}
                    onChange={(e) => setNodeData({...nodeData, timeout: parseInt(e.target.value)})}
                    min={1}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <Button onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}