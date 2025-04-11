
import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface DraggableBlockProps {
  id: string;
  type: string;
  category: 'motion' | 'looks' | 'control';
  children: React.ReactNode;
  onDragStart?: (e: React.DragEvent, id: string, type: string, category: string) => void;
  isTemplate?: boolean;
  connectTop?: boolean;
  connectBottom?: boolean;
  className?: string;
  isDragging?: boolean;
}

const DraggableBlock: React.FC<DraggableBlockProps> = ({
  id,
  type,
  category,
  children,
  onDragStart,
  isTemplate = false,
  connectTop = false,
  connectBottom = true,
  className,
  isDragging = false
}) => {
  const [isDraggingState, setIsDraggingState] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);

  const getBgColor = () => {
    switch (category) {
      case 'motion':
        return 'bg-motion hover:bg-motion-light';
      case 'looks':
        return 'bg-looks hover:bg-looks-light';
      case 'control':
        return 'bg-control hover:bg-control-light';
      default:
        return 'bg-motion hover:bg-motion-light';
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (isTemplate) {
      // For template blocks, we generate a new ID
      const newId = `${type}-${Date.now()}`;
      if (onDragStart) onDragStart(e, newId, type, category);
    } else {
      if (onDragStart) onDragStart(e, id, type, category);
    }
    
    // Set data for drag operation
    e.dataTransfer.setData('application/json', JSON.stringify({
      id: isTemplate ? `${type}-${Date.now()}` : id,
      type,
      category,
      isTemplate
    }));
    
    // Create a ghost image for dragging
    if (blockRef.current) {
      const rect = blockRef.current.getBoundingClientRect();
      const ghostElement = blockRef.current.cloneNode(true) as HTMLDivElement;
      ghostElement.style.position = 'absolute';
      ghostElement.style.top = '-1000px';
      document.body.appendChild(ghostElement);
      e.dataTransfer.setDragImage(ghostElement, rect.width / 2, 15);
      
      // Remove the ghost element after drag starts
      setTimeout(() => {
        document.body.removeChild(ghostElement);
      }, 0);
    }
    
    setIsDraggingState(true);
  };

  const handleDragEnd = () => {
    setIsDraggingState(false);
  };

  return (
    <div
      ref={blockRef}
      draggable={!isTemplate || true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        'relative rounded-md py-2 px-3 mb-1 cursor-grab active:cursor-grabbing text-white shadow-md',
        getBgColor(),
        {
          'opacity-50': isDragging || isDraggingState,
          'ml-8': !isTemplate && !connectTop, // Indent blocks that don't connect at top
        },
        className
      )}
      data-block-id={id}
      data-block-type={type}
      data-block-category={category}
    >
      {/* Connection notch at the top */}
      {connectTop && !isTemplate && (
        <div className="absolute top-0 left-4 w-8 h-2 -mt-2 bg-white rounded-t-md" />
      )}
      
      {/* Block content */}
      <div className="flex items-center">
        {children}
      </div>
      
      {/* Connection notch at the bottom */}
      {connectBottom && !isTemplate && (
        <div className="absolute bottom-0 left-4 w-8 h-2 -mb-2 bg-white rounded-b-md" />
      )}
    </div>
  );
};

export default DraggableBlock;
