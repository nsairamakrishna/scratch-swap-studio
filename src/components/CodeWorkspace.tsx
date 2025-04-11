
import React, { useState } from 'react';
import DraggableBlock from './DraggableBlock';
import NumberInput from './NumberInput';
import TextInput from './TextInput';
import { Sprite } from '@/types/sprite';
import { Block } from '@/types/block';

interface CodeWorkspaceProps {
  selectedSpriteId: string | null;
  sprites: Sprite[];
  onUpdateSprite: (sprite: Sprite) => void;
}

const CodeWorkspace: React.FC<CodeWorkspaceProps> = ({
  selectedSpriteId,
  sprites,
  onUpdateSprite
}) => {
  const [blockBeingDragged, setBlockBeingDragged] = useState<string | null>(null);
  
  const selectedSprite = sprites.find(s => s.id === selectedSpriteId);

  // Handle when a block is dropped into the workspace
  const handleBlockDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!selectedSpriteId) return;
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      
      if (data.isTemplate) {
        // Create a new block instance from the template
        let newBlock: Block;
        
        switch (data.type) {
          case 'move':
            newBlock = {
              id: data.id,
              type: 'move',
              category: 'motion',
              params: { steps: 10 }
            };
            break;
          case 'turn':
            newBlock = {
              id: data.id,
              type: 'turn',
              category: 'motion',
              params: { degrees: 15 }
            };
            break;
          case 'goto':
            newBlock = {
              id: data.id,
              type: 'goto',
              category: 'motion',
              params: { x: 0, y: 0 }
            };
            break;
          case 'say':
            newBlock = {
              id: data.id,
              type: 'say',
              category: 'looks',
              params: { text: 'Hello!', seconds: 2 }
            };
            break;
          case 'think':
            newBlock = {
              id: data.id,
              type: 'think',
              category: 'looks',
              params: { text: 'Hmm...', seconds: 2 }
            };
            break;
          case 'repeat':
            newBlock = {
              id: data.id,
              type: 'repeat',
              category: 'control',
              params: { times: 10 },
              children: []
            };
            break;
          default:
            return;
        }
        
        // Add the new block to the sprite's scripts
        const updatedSprite = {
          ...selectedSprite!,
          scripts: [...(selectedSprite?.scripts || []), newBlock]
        };
        
        onUpdateSprite(updatedSprite);
      }
    } catch (err) {
      console.error('Error parsing drag data:', err);
    }
  };

  // Allow blocks to be dropped in the workspace
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Update a block parameter
  const updateBlockParam = (blockId: string, paramName: string, value: any) => {
    if (!selectedSpriteId || !selectedSprite) return;
    
    const updatedScripts = [...selectedSprite.scripts];
    
    // Find and update the block
    const updateNestedBlocks = (blocks: Block[]): Block[] => {
      return blocks.map(block => {
        if (block.id === blockId) {
          return {
            ...block,
            params: {
              ...block.params,
              [paramName]: value
            }
          };
        }
        
        // Check for nested blocks (in repeat blocks)
        if (block.children) {
          return {
            ...block,
            children: updateNestedBlocks(block.children)
          };
        }
        
        return block;
      });
    };
    
    const newScripts = updateNestedBlocks(updatedScripts);
    
    // Update the sprite with the modified scripts
    const updatedSprite = {
      ...selectedSprite,
      scripts: newScripts
    };
    
    onUpdateSprite(updatedSprite);
  };

  // Delete a block
  const deleteBlock = (blockId: string) => {
    if (!selectedSpriteId || !selectedSprite) return;
    
    // Filter out the block with the given ID
    const filterBlocks = (blocks: Block[]): Block[] => {
      return blocks
        .filter(block => block.id !== blockId)
        .map(block => {
          if (block.children) {
            return {
              ...block,
              children: filterBlocks(block.children)
            };
          }
          return block;
        });
    };
    
    const newScripts = filterBlocks(selectedSprite.scripts);
    
    // Update the sprite with the modified scripts
    const updatedSprite = {
      ...selectedSprite,
      scripts: newScripts
    };
    
    onUpdateSprite(updatedSprite);
  };

  // Add a block to a repeat block
  const addBlockToRepeat = (repeatBlockId: string, childBlock: Block) => {
    if (!selectedSpriteId || !selectedSprite) return;
    
    const updatedScripts = [...selectedSprite.scripts];
    
    // Find the repeat block and add the child block
    const updateNestedBlocks = (blocks: Block[]): Block[] => {
      return blocks.map(block => {
        if (block.id === repeatBlockId) {
          return {
            ...block,
            children: [...(block.children || []), childBlock]
          };
        }
        
        // Check for nested blocks
        if (block.children) {
          return {
            ...block,
            children: updateNestedBlocks(block.children)
          };
        }
        
        return block;
      });
    };
    
    const newScripts = updateNestedBlocks(updatedScripts);
    
    // Update the sprite with the modified scripts
    const updatedSprite = {
      ...selectedSprite,
      scripts: newScripts
    };
    
    onUpdateSprite(updatedSprite);
  };

  // Handle dropping a block onto a repeat block
  const handleRepeatBlockDrop = (e: React.DragEvent, repeatBlockId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      
      if (data.isTemplate) {
        // Create a new block instance
        let newBlock: Block;
        
        switch (data.type) {
          case 'move':
            newBlock = {
              id: data.id,
              type: 'move',
              category: 'motion',
              params: { steps: 10 }
            };
            break;
          case 'turn':
            newBlock = {
              id: data.id,
              type: 'turn',
              category: 'motion',
              params: { degrees: 15 }
            };
            break;
          case 'goto':
            newBlock = {
              id: data.id,
              type: 'goto',
              category: 'motion',
              params: { x: 0, y: 0 }
            };
            break;
          case 'say':
            newBlock = {
              id: data.id,
              type: 'say',
              category: 'looks',
              params: { text: 'Hello!', seconds: 2 }
            };
            break;
          case 'think':
            newBlock = {
              id: data.id,
              type: 'think',
              category: 'looks',
              params: { text: 'Hmm...', seconds: 2 }
            };
            break;
          default:
            return;
        }
        
        // Add the new block to the repeat block
        addBlockToRepeat(repeatBlockId, newBlock);
      }
    } catch (err) {
      console.error('Error parsing drag data for repeat block:', err);
    }
  };

  // Render block content based on type
  const renderBlockContent = (block: Block) => {
    switch (block.type) {
      case 'move':
        return (
          <>
            <span>move</span>
            <NumberInput
              value={block.params.steps}
              onChange={(value) => updateBlockParam(block.id, 'steps', value)}
              width="40px"
            />
            <span>steps</span>
          </>
        );
      case 'turn':
        return (
          <>
            <span>turn</span>
            <NumberInput
              value={block.params.degrees}
              onChange={(value) => updateBlockParam(block.id, 'degrees', value)}
              width="40px"
            />
            <span>degrees</span>
          </>
        );
      case 'goto':
        return (
          <>
            <span>go to x:</span>
            <NumberInput
              value={block.params.x}
              onChange={(value) => updateBlockParam(block.id, 'x', value)}
              width="40px"
            />
            <span>y:</span>
            <NumberInput
              value={block.params.y}
              onChange={(value) => updateBlockParam(block.id, 'y', value)}
              width="40px"
            />
          </>
        );
      case 'say':
        return (
          <>
            <span>say</span>
            <TextInput
              value={block.params.text}
              onChange={(value) => updateBlockParam(block.id, 'text', value)}
              width="80px"
            />
            <span>for</span>
            <NumberInput
              value={block.params.seconds}
              onChange={(value) => updateBlockParam(block.id, 'seconds', value)}
              width="30px"
            />
            <span>seconds</span>
          </>
        );
      case 'think':
        return (
          <>
            <span>think</span>
            <TextInput
              value={block.params.text}
              onChange={(value) => updateBlockParam(block.id, 'text', value)}
              width="80px"
            />
            <span>for</span>
            <NumberInput
              value={block.params.seconds}
              onChange={(value) => updateBlockParam(block.id, 'seconds', value)}
              width="30px"
            />
            <span>seconds</span>
          </>
        );
      case 'repeat':
        return (
          <>
            <span>repeat</span>
            <NumberInput
              value={block.params.times}
              onChange={(value) => updateBlockParam(block.id, 'times', value)}
              width="40px"
            />
            <span>times</span>
          </>
        );
      default:
        return <span>Unknown block type</span>;
    }
  };

  // Recursively render blocks
  const renderBlocks = (blocks: Block[]) => {
    return blocks.map((block, index) => {
      // For repeat blocks, render their children as well
      if (block.type === 'repeat') {
        return (
          <div key={block.id} className="mb-2">
            <DraggableBlock
              id={block.id}
              type={block.type}
              category={block.category as 'motion' | 'looks' | 'control'}
              isDragging={blockBeingDragged === block.id}
              connectTop={index > 0}
              connectBottom={false}
            >
              {renderBlockContent(block)}
              <button
                className="ml-2 text-white opacity-70 hover:opacity-100"
                onClick={() => deleteBlock(block.id)}
              >
                ✕
              </button>
            </DraggableBlock>
            
            {/* Nested blocks container */}
            <div
              className="ml-8 pl-4 border-l-2 border-control border-dashed"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleRepeatBlockDrop(e, block.id)}
            >
              {block.children && block.children.length > 0 ? (
                renderBlocks(block.children)
              ) : (
                <div className="py-2 px-3 text-sm text-gray-500 italic">
                  Drag blocks here
                </div>
              )}
            </div>
            
            {/* End block */}
            <DraggableBlock
              id={`${block.id}-end`}
              type="end"
              category="control"
              connectTop={false}
              connectBottom={index < blocks.length - 1}
            >
              <span>end repeat</span>
            </DraggableBlock>
          </div>
        );
      }
      
      // Regular blocks
      return (
        <DraggableBlock
          key={block.id}
          id={block.id}
          type={block.type}
          category={block.category as 'motion' | 'looks' | 'control'}
          isDragging={blockBeingDragged === block.id}
          connectTop={index > 0}
          connectBottom={index < blocks.length - 1}
        >
          {renderBlockContent(block)}
          <button
            className="ml-2 text-white opacity-70 hover:opacity-100"
            onClick={() => deleteBlock(block.id)}
          >
            ✕
          </button>
        </DraggableBlock>
      );
    });
  };

  return (
    <div
      className="h-full p-4 bg-white rounded-lg shadow overflow-y-auto"
      onDragOver={handleDragOver}
      onDrop={handleBlockDrop}
    >
      {selectedSpriteId ? (
        <>
          <h3 className="text-lg font-semibold mb-3">
            Code for {selectedSprite?.name || 'Sprite'}
          </h3>
          
          <div className="space-y-1">
            {selectedSprite?.scripts && selectedSprite.scripts.length > 0 ? (
              renderBlocks(selectedSprite.scripts)
            ) : (
              <div className="p-4 text-center text-gray-500 border-2 border-dashed rounded">
                Drag blocks here to create code for this sprite
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-500">Select a sprite to see its code</p>
        </div>
      )}
    </div>
  );
};

export default CodeWorkspace;
