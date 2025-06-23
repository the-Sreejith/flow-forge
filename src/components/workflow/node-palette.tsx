'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { 
  Search,
  Zap, 
  Database, 
  Mail, 
  Globe, 
  Webhook, 
  Calculator,
  Clock,
  FileText,
  Filter,
  Code,
  MessageSquare,
  Calendar,
  Camera,
  ShoppingCart,
  Users,
  BarChart3,
  GitBranch,
  Shuffle
} from 'lucide-react';

const nodeCategories = [
  {
    name: 'Triggers',
    nodes: [
      {
        type: 'webhook',
        label: 'Webhook',
        icon: 'Webhook',
        color: 'green',
        description: 'Trigger workflow via HTTP request'
      },
      {
        type: 'schedule',
        label: 'Schedule',
        icon: 'Clock',
        color: 'blue',
        description: 'Run workflow on schedule'
      },
      {
        type: 'email_trigger',
        label: 'Email Received',
        icon: 'Mail',
        color: 'green',
        description: 'Trigger when email is received'
      }
    ]
  },
  {
    name: 'Actions',
    nodes: [
      {
        type: 'email',
        label: 'Send Email',
        icon: 'Mail',
        color: 'blue',
        description: 'Send email message'
      },
      {
        type: 'http_request',
        label: 'HTTP Request',
        icon: 'Globe',
        color: 'purple',
        description: 'Make HTTP API call'
      },
      {
        type: 'database',
        label: 'Database',
        icon: 'Database',
        color: 'orange',
        description: 'Query or update database'
      },
      {
        type: 'file',
        label: 'File Operation',
        icon: 'FileText',
        color: 'gray',
        description: 'Read, write, or process files'
      }
    ]
  },
  {
    name: 'Logic',
    nodes: [
      {
        type: 'condition',
        label: 'IF Condition',
        icon: 'GitBranch',
        color: 'yellow',
        description: 'Branch workflow based on condition'
      },
      {
        type: 'function',
        label: 'Function',
        icon: 'Code',
        color: 'purple',
        description: 'Execute custom JavaScript code'
      },
      {
        type: 'filter',
        label: 'Filter',
        icon: 'Filter',
        color: 'blue',
        description: 'Filter data based on criteria'
      },
      {
        type: 'merge',
        label: 'Merge',
        icon: 'Shuffle',
        color: 'green',
        description: 'Merge multiple data streams'
      }
    ]
  },
  {
    name: 'Data',
    nodes: [
      {
        type: 'transform',
        label: 'Transform',
        icon: 'Calculator',
        color: 'blue',
        description: 'Transform and manipulate data'
      },
      {
        type: 'csv',
        label: 'CSV Parser',
        icon: 'FileText',
        color: 'green',
        description: 'Parse CSV data'
      }
    ]
  },
  {
    name: 'Integrations',
    nodes: [
      {
        type: 'slack',
        label: 'Slack',
        icon: 'MessageSquare',
        color: 'purple',
        description: 'Send Slack messages'
      },
      {
        type: 'google_sheets',
        label: 'Google Sheets',
        icon: 'BarChart3',
        color: 'green',
        description: 'Read/write Google Sheets'
      },
      {
        type: 'calendar',
        label: 'Calendar',
        icon: 'Calendar',
        color: 'blue',
        description: 'Create calendar events'
      }
    ]
  }
];

const iconMap: { [key: string]: any } = {
  Webhook, Database, Mail, Globe, Calculator, Clock, FileText, Filter, Code,
  MessageSquare, Calendar, Camera, ShoppingCart, Users, BarChart3, GitBranch, Shuffle
};

export function NodePalette() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = nodeCategories.map(category => ({
    ...category,
    nodes: category.nodes.filter(node =>
      node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.nodes.length > 0);

  const onDragStart = (event: React.DragEvent, nodeData: any) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-50 border-green-200 hover:bg-green-100 text-green-700';
      case 'blue':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700';
      case 'purple':
        return 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700';
      case 'orange':
        return 'bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100 text-yellow-700';
      case 'red':
        return 'bg-red-50 border-red-200 hover:bg-red-100 text-red-700';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Node Library</h2>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {filteredCategories.map((category) => (
          <div key={category.name}>
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              {category.name}
              <Badge variant="outline" className="ml-2 text-xs">
                {category.nodes.length}
              </Badge>
            </h3>
            
            <div className="space-y-2">
              {category.nodes.map((node) => {
                const IconComponent = iconMap[node.icon];
                return (
                  <div
                    key={node.type}
                    draggable
                    onDragStart={(event) => onDragStart(event, node)}
                    className={`
                      p-3 rounded-lg border cursor-grab active:cursor-grabbing transition-colors
                      ${getColorClasses(node.color)}
                    `}
                  >
                    <div className="flex items-start space-x-3">
                      {IconComponent && (
                        <div className="flex-shrink-0 mt-0.5">
                          <IconComponent className="h-4 w-4" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{node.label}</p>
                        <p className="text-xs opacity-75 mt-1 line-clamp-2">
                          {node.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredCategories.length === 0 && (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No nodes found</p>
            <p className="text-sm text-gray-400">Try adjusting your search</p>
          </div>
        )}
      </div>
    </div>
  );
}