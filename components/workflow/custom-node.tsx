'use client';

import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function CustomNode({ data, selected }: NodeProps) {
  const IconComponent = data.icon;
  
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return 'border-green-300 bg-green-50 shadow-green-100';
      case 'blue':
        return 'border-blue-300 bg-blue-50 shadow-blue-100';
      case 'purple':
        return 'border-purple-300 bg-purple-50 shadow-purple-100';
      case 'orange':
        return 'border-orange-300 bg-orange-50 shadow-orange-100';
      case 'yellow':
        return 'border-yellow-300 bg-yellow-50 shadow-yellow-100';
      case 'red':
        return 'border-red-300 bg-red-50 shadow-red-100';
      default:
        return 'border-gray-300 bg-gray-50 shadow-gray-100';
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case 'green': return 'text-green-600';
      case 'blue': return 'text-blue-600';
      case 'purple': return 'text-purple-600';
      case 'orange': return 'text-orange-600';
      case 'yellow': return 'text-yellow-600';
      case 'red': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
      />
      
      <Card className={`
        w-48 transition-all duration-200 cursor-pointer
        ${getColorClasses(data.color)}
        ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        hover:shadow-lg
      `}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className={`flex-shrink-0 ${getIconColor(data.color)}`}>
              {IconComponent && <IconComponent className="h-5 w-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">
                {data.label}
              </p>
              {data.description && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {data.description}
                </p>
              )}
            </div>
          </div>
          
          {data.status && (
            <div className="mt-3">
              <Badge 
                variant={data.status === 'success' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {data.status}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
      />
    </div>
  );
}