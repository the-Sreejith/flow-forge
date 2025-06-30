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

// src/components/dashboard/stats-cards.tsx

// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Workflow, Play, CheckCircle, XCircle, TrendingUp, Activity } from 'lucide-react';

// interface Workflow {
//   id: string;
//   name: string;
//   status: 'active' | 'inactive' | 'error';
//   runs: number;
//   successRate: number;
// }

// interface Stats {
//   total: number;
//   active: number;
//   inactive: number;
//   error: number;
//   totalRuns: number;
//   avgSuccessRate: number;
// }

// interface StatsCardsProps {
//   workflows: Workflow[];
//   stats?: Stats;
//   loading?: boolean;
// }

// export function StatsCards({ workflows, stats, loading = false }: StatsCardsProps) {
//   // Use provided stats or calculate from workflows
//   const calculatedStats = stats || {
//     total: workflows.length,
//     active: workflows.filter(w => w.status === 'active').length,
//     inactive: workflows.filter(w => w.status === 'inactive').length,
//     error: workflows.filter(w => w.status === 'error').length,
//     totalRuns: workflows.reduce((sum, w) => sum + w.runs, 0),
//     avgSuccessRate: workflows.length > 0 
//       ? workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length 
//       : 0
//   };

//   const statCards = [
//     {
//       title: 'Total Workflows',
//       value: loading ? '--' : calculatedStats.total.toString(),
//       icon: Workflow,
//       color: 'text-blue-600',
//       bgColor: 'bg-blue-50',
//       change: null
//     },
//     {
//       title: 'Active Workflows',
//       value: loading ? '--' : calculatedStats.active.toString(),
//       icon: Play,
//       color: 'text-green-600',
//       bgColor: 'bg-green-50',
//       change: null
//     },
//     {
//       title: 'Total Executions',
//       value: loading ? '--' : calculatedStats.totalRuns.toLocaleString(),
//       icon: Activity,
//       color: 'text-purple-600',
//       bgColor: 'bg-purple-50',
//       change: null
//     },
//     {
//       title: 'Success Rate',
//       value: loading ? '--' : `${calculatedStats.avgSuccessRate.toFixed(1)}%`,
//       icon: TrendingUp,
//       color: calculatedStats.avgSuccessRate >= 95 ? 'text-green-600' : 
//              calculatedStats.avgSuccessRate >= 80 ? 'text-yellow-600' : 'text-red-600',
//       bgColor: calculatedStats.avgSuccessRate >= 95 ? 'bg-green-50' : 
//                calculatedStats.avgSuccessRate >= 80 ? 'bg-yellow-50' : 'bg-red-50',
//       change: null
//     }
//   ];

//   if (loading) {
//     return (
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {statCards.map((stat, index) => (
//           <Card key={index} className="animate-pulse">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-gray-500">
//                 {stat.title}
//               </CardTitle>
//               <div className={`h-4 w-4 ${stat.bgColor} rounded`} />
//             </CardHeader>
//             <CardContent>
//               <div className="h-8 bg-gray-200 rounded w-16" />
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//       {statCards.map((stat, index) => {
//         const Icon = stat.icon;
//         return (
//           <Card key={index} className="hover:shadow-md transition-shadow">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-gray-500">
//                 {stat.title}
//               </CardTitle>
//               <div className={`${stat.bgColor} p-2 rounded-lg`}>
//                 <Icon className={`h-4 w-4 ${stat.color}`} />
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
//               {stat.change && (
//                 <p className="text-xs text-gray-500 mt-1">
//                   {stat.change}
//                 </p>
//               )}
//             </CardContent>
//           </Card>
//         );
//       })}
      
//       {/* Status Breakdown Card */}
//       {calculatedStats.total > 0 && (
//         <Card className="md:col-span-2 lg:col-span-4 hover:shadow-md transition-shadow">
//           <CardHeader>
//             <CardTitle className="text-sm font-medium text-gray-500">Workflow Status</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="flex items-center space-x-8">
//               <div className="flex items-center space-x-2">
//                 <div className="flex items-center space-x-1">
//                   <CheckCircle className="h-4 w-4 text-green-600" />
//                   <span className="text-sm text-gray-600">Active</span>
//                 </div>
//                 <span className="text-lg font-semibold text-gray-900">
//                   {calculatedStats.active}
//                 </span>
//               </div>
              
//               <div className="flex items-center space-x-2">
//                 <div className="flex items-center space-x-1">
//                   <div className="h-4 w-4 rounded-full bg-gray-400" />
//                   <span className="text-sm text-gray-600">Inactive</span>
//                 </div>
//                 <span className="text-lg font-semibold text-gray-900">
//                   {calculatedStats.inactive}
//                 </span>
//               </div>
              
//               <div className="flex items-center space-x-2">
//                 <div className="flex items-center space-x-1">
//                   <XCircle className="h-4 w-4 text-red-600" />
//                   <span className="text-sm text-gray-600">Error</span>
//                 </div>
//                 <span className="text-lg font-semibold text-gray-900">
//                   {calculatedStats.error}
//                 </span>
//               </div>
              
//               {/* Progress bar */}
//               <div className="flex-1 ml-8">
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div 
//                     className="bg-green-600 h-2 rounded-l-full" 
//                     style={{ width: `${(calculatedStats.active / calculatedStats.total) * 100}%` }}
//                   />
//                   <div 
//                     className="bg-gray-400 h-2" 
//                     style={{ width: `${(calculatedStats.inactive / calculatedStats.total) * 100}%` }}
//                   />
//                   <div 
//                     className="bg-red-600 h-2 rounded-r-full" 
//                     style={{ width: `${(calculatedStats.error / calculatedStats.total) * 100}%` }}
//                   />
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }