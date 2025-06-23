

import { WorkflowBuilder } from '@/components/workflow/workflow-builder';

export async function generateStaticParams() {
  // Return an array of possible workflow IDs for static generation
  // You can modify this to fetch actual workflow IDs from your data source
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: 'demo' },
    { id: 'example' }
  ];
}

export default function EditWorkflowPage({ params }: { params: { id: string } }) {
  return <WorkflowBuilder workflowId={params.id} />;
}