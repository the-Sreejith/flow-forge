'use client';

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, CheckCircle, AlertCircle, Pause } from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  lastModified: string;
  runs: number;
  successRate: number;
  nodes: number;
  category: string;
}

interface StatsCardsProps {
  workflows: Workflow[];
}

export function StatsCards({ workflows }: StatsCardsProps) {
  const totalWorkflows = workflows.length;
  const activeWorkflows = workflows.filter(w => w.status === 'active').length;
  const errorWorkflows = workflows.filter(w => w.status === 'error').length;
  const totalRuns = workflows.reduce((sum, w) => sum + w.runs, 0);
  const avgSuccessRate = workflows.length > 0 
    ? workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length 
    : 0;

  const stats = [
    {
      name: 'Total Workflows',
      value: totalWorkflows.toString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: Activity,
      color: 'blue'
    },
    {
      name: 'Active Workflows',
      value: activeWorkflows.toString(),
      change: '+5%',
      changeType: 'positive' as const,
      icon: CheckCircle,
      color: 'green'
    },
    {
      name: 'Total Executions',
      value: totalRuns.toLocaleString(),
      change: '+23%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'purple'
    },
    {
      name: 'Success Rate',
      value: `${avgSuccessRate.toFixed(1)}%`,
      change: '-2%',
      changeType: 'negative' as const,
      icon: AlertCircle,
      color: errorWorkflows > 0 ? 'red' : 'green'
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'green':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'purple':
        return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'red':
        return 'bg-red-50 text-red-600 border-red-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.name} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.changeType === 'positive' ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className={`p-3 rounded-full border ${getColorClasses(stat.color)}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}