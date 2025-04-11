
import React from 'react';
import DraggableBlock from './DraggableBlock';
import NumberInput from './NumberInput';
import TextInput from './TextInput';
import { cn } from '@/lib/utils';

interface BlocksListProps {
  category: 'motion' | 'looks' | 'control';
  onDragStart: (e: React.DragEvent, id: string, type: string, category: string) => void;
  className?: string;
}

const BlocksList: React.FC<BlocksListProps> = ({ category, onDragStart, className }) => {
  const getMotionBlocks = () => (
    <>
      <DraggableBlock 
        id="move-template" 
        type="move" 
        category="motion" 
        onDragStart={onDragStart}
        isTemplate={true}
      >
        <span>move</span>
        <NumberInput value={10} onChange={() => {}} width="40px" />
        <span>steps</span>
      </DraggableBlock>
      
      <DraggableBlock 
        id="turn-template" 
        type="turn" 
        category="motion" 
        onDragStart={onDragStart}
        isTemplate={true}
      >
        <span>turn</span>
        <NumberInput value={15} onChange={() => {}} width="40px" />
        <span>degrees</span>
      </DraggableBlock>
      
      <DraggableBlock 
        id="goto-template" 
        type="goto" 
        category="motion" 
        onDragStart={onDragStart}
        isTemplate={true}
      >
        <span>go to x:</span>
        <NumberInput value={0} onChange={() => {}} width="40px" />
        <span>y:</span>
        <NumberInput value={0} onChange={() => {}} width="40px" />
      </DraggableBlock>
    </>
  );
  
  const getLooksBlocks = () => (
    <>
      <DraggableBlock 
        id="say-template" 
        type="say" 
        category="looks" 
        onDragStart={onDragStart}
        isTemplate={true}
      >
        <span>say</span>
        <TextInput value="Hello!" onChange={() => {}} width="80px" />
        <span>for</span>
        <NumberInput value={2} onChange={() => {}} width="30px" />
        <span>seconds</span>
      </DraggableBlock>
      
      <DraggableBlock 
        id="think-template" 
        type="think" 
        category="looks" 
        onDragStart={onDragStart}
        isTemplate={true}
      >
        <span>think</span>
        <TextInput value="Hmm..." onChange={() => {}} width="80px" />
        <span>for</span>
        <NumberInput value={2} onChange={() => {}} width="30px" />
        <span>seconds</span>
      </DraggableBlock>
    </>
  );
  
  const getControlBlocks = () => (
    <>
      <DraggableBlock 
        id="repeat-template" 
        type="repeat" 
        category="control" 
        onDragStart={onDragStart}
        isTemplate={true}
      >
        <span>repeat</span>
        <NumberInput value={10} onChange={() => {}} width="40px" />
        <span>times</span>
      </DraggableBlock>
    </>
  );
  
  const getBlocks = () => {
    switch (category) {
      case 'motion':
        return getMotionBlocks();
      case 'looks':
        return getLooksBlocks();
      case 'control':
        return getControlBlocks();
      default:
        return null;
    }
  };

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      {getBlocks()}
    </div>
  );
};

export default BlocksList;
