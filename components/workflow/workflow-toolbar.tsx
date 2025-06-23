'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  Play, 
  Square, 
  Download, 
  Upload, 
  Undo2, 
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize
} from 'lucide-react';

interface WorkflowToolbarProps {
  onSave: () => void;
  onRun: () => void;
}

export function WorkflowToolbar({ onSave, onRun }: WorkflowToolbarProps) {
  return (
    <div className="flex items-center space-x-2">
      <Button onClick={onSave} variant="outline" size="sm">
        <Save className="h-4 w-4 mr-2" />
        Save
      </Button>
      
      <Button onClick={onRun} className="bg-green-600 hover:bg-green-700" size="sm">
        <Play className="h-4 w-4 mr-2" />
        Run Workflow
      </Button>
      
      <Separator orientation="vertical" className="h-6" />
      
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="sm">
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>
      
      <Separator orientation="vertical" className="h-6" />
      
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="sm">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Maximize className="h-4 w-4" />
        </Button>
      </div>
      
      <Separator orientation="vertical" className="h-6" />
      
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="sm">
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Upload className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}