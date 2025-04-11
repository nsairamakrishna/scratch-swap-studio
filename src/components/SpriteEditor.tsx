
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sprite } from '@/types/sprite';
import { Square, Circle, Flag } from 'lucide-react';

interface SpriteEditorProps {
  sprites: Sprite[];
  selectedSpriteId: string | null;
  onSelectSprite: (id: string) => void;
  onAddSprite: (sprite: Sprite) => void;
  onUpdateSprite: (sprite: Sprite) => void;
  onDeleteSprite: (id: string) => void;
}

const SPRITE_SHAPES = [
  { name: 'Square', icon: Square, color: '#3182CE' },
  { name: 'Circle', icon: Circle, color: '#805AD5' },
  { name: 'Flag', icon: Flag, color: '#38A169' },
];

const SpriteEditor: React.FC<SpriteEditorProps> = ({
  sprites,
  selectedSpriteId,
  onSelectSprite,
  onAddSprite,
  onUpdateSprite,
  onDeleteSprite
}) => {
  const [spriteName, setSpriteName] = useState('');
  const selectedSprite = sprites.find(s => s.id === selectedSpriteId);

  const handleAddSprite = (shapeIndex: number) => {
    const shape = SPRITE_SHAPES[shapeIndex];
    const newSprite: Sprite = {
      id: `sprite-${Date.now()}`,
      name: spriteName || `Sprite ${sprites.length + 1}`,
      color: shape.color,
      width: 50,
      height: 50,
      shape: shape.name.toLowerCase(),
      scripts: []
    };
    
    onAddSprite(newSprite);
    setSpriteName('');
  };

  const handleRenameSprite = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedSprite) return;
    
    const updatedSprite = {
      ...selectedSprite,
      name: e.target.value
    };
    
    onUpdateSprite(updatedSprite);
  };

  const handleDeleteSprite = () => {
    if (!selectedSpriteId) return;
    onDeleteSprite(selectedSpriteId);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3">Sprites</h3>
      
      {/* Sprite list */}
      <div className="mb-4 max-h-40 overflow-y-auto">
        {sprites.length === 0 ? (
          <p className="text-sm text-gray-500">No sprites yet. Create one below!</p>
        ) : (
          <div className="space-y-2">
            {sprites.map(sprite => (
              <div 
                key={sprite.id}
                className={`p-2 rounded cursor-pointer flex items-center ${
                  selectedSpriteId === sprite.id ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-100'
                }`}
                onClick={() => onSelectSprite(sprite.id)}
              >
                <div 
                  className="w-6 h-6 mr-2 rounded"
                  style={{ backgroundColor: sprite.color }}
                />
                <span className="text-sm">{sprite.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Create new sprite */}
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">Create New Sprite</h4>
        <input
          type="text"
          value={spriteName}
          onChange={(e) => setSpriteName(e.target.value)}
          placeholder="Sprite name"
          className="w-full p-2 mb-2 border rounded text-sm"
        />
        <div className="flex space-x-2 mt-2">
          {SPRITE_SHAPES.map((shape, index) => (
            <Button
              key={shape.name}
              variant="outline"
              size="sm"
              onClick={() => handleAddSprite(index)}
              className="flex-1"
            >
              <shape.icon className="mr-1" size={16} />
              <span className="text-xs">{shape.name}</span>
            </Button>
          ))}
        </div>
      </div>
      
      {/* Edit selected sprite */}
      {selectedSprite && (
        <div className="border-t pt-3">
          <h4 className="text-sm font-medium mb-2">Edit {selectedSprite.name}</h4>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-500">Name:</label>
              <input
                type="text"
                value={selectedSprite.name}
                onChange={handleRenameSprite}
                className="w-full p-2 border rounded text-sm"
              />
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSprite}
              className="w-full mt-2"
            >
              Delete Sprite
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpriteEditor;
