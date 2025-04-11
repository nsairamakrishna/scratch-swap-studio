import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import BlocksList from '@/components/BlocksList';
import SpriteEditor from '@/components/SpriteEditor';
import CodeWorkspace from '@/components/CodeWorkspace';
import Canvas from '@/components/Canvas';
import { Sprite } from '@/types/sprite';
import { Block } from '@/types/block';
import { Play, Pause, RotateCcw } from 'lucide-react';

const Index = () => {
  const [sprites, setSprites] = useState<Sprite[]>([]);
  const [selectedSpriteId, setSelectedSpriteId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [spriteStates, setSpriteStates] = useState<Record<string, any>>({});
  const originalScriptsRef = useRef<Record<string, Block[]>>({});
  const animationIntervalRef = useRef<number | null>(null);
  const spritesRef = useRef<Sprite[]>(sprites);

  useEffect(() => {
    spritesRef.current = sprites;
  }, [sprites]);

  useEffect(() => {
    if (sprites.length === 0) {
      handleAddSprite({
        id: `sprite-${Date.now()}`,
        name: 'Sprite 1',
        color: '#4C97FF',
        width: 50,
        height: 50,
        shape: 'square',
        scripts: []
      });
    }
  }, []);

  useEffect(() => {
    const newSpriteStates = { ...spriteStates };
    sprites.forEach(sprite => {
      if (!newSpriteStates[sprite.id]) {
        newSpriteStates[sprite.id] = {
          x: 0,
          y: 0,
          direction: 90,
          sayText: null,
          thinkText: null,
          textTimer: null,
          isThinking: false
        };
      }
    });
    Object.keys(newSpriteStates).forEach(id => {
      if (!sprites.find(s => s.id === id)) {
        delete newSpriteStates[id];
      }
    });
    setSpriteStates(newSpriteStates);
  }, [sprites]);

  const handleAddSprite = (sprite: Sprite) => {
    setSprites(prev => [...prev, sprite]);
    setSelectedSpriteId(sprite.id);
  };

  const handleUpdateSprite = (updatedSprite: Sprite) => {
    setSprites(prev => prev.map(sprite => sprite.id === updatedSprite.id ? updatedSprite : sprite));
  };

  const handleDeleteSprite = (id: string) => {
    setSprites(prev => prev.filter(sprite => sprite.id !== id));
    if (selectedSpriteId === id) {
      setSelectedSpriteId(null);
    }
  };

  const executeScriptsForSprite = (spriteId: string, scripts: Block[], loopIndices: Record<string, number> = {}) => {
    const sprite = spritesRef.current.find(s => s.id === spriteId);
    if (!sprite) return;

    const state = { ...spriteStates[spriteId] };

    const processBlock = (block: Block) => {
      switch (block.type) {
        case 'move': {
          const radians = (state.direction - 90) * Math.PI / 180;
          state.x += block.params.steps * Math.cos(radians);
          state.y += block.params.steps * Math.sin(radians);
          break;
        }
        case 'turn': {
          state.direction = (state.direction + block.params.degrees) % 360;
          if (state.direction < 0) state.direction += 360;
          break;
        }
        case 'goto': {
          state.x = block.params.x;
          state.y = block.params.y;
          break;
        }
        case 'say': {
          state.sayText = block.params.text;
          state.thinkText = null;
          state.textTimer = block.params.seconds;
          state.isThinking = false;
          break;
        }
        case 'think': {
          state.thinkText = block.params.text;
          state.sayText = null;
          state.textTimer = block.params.seconds;
          state.isThinking = true;
          break;
        }
        case 'repeat': {
          const times = block.params.times;
          if (block.children?.length) {
            for (let i = 0; i < times; i++) {
              processScript(block.children);
            }
          }
          break;
        }
        default:
          break;
      }
    };

    const processScript = (blocks: Block[]) => {
      blocks.forEach(block => {
        processBlock(block);
      });
    };

    processScript(scripts);

    setSpriteStates(prev => ({ ...prev, [spriteId]: state }));
  };

  const startAnimation = () => {
    const originalScripts: Record<string, Block[]> = {};
    sprites.forEach(sprite => {
      originalScripts[sprite.id] = [...sprite.scripts];
    });
    originalScriptsRef.current = originalScripts;

    setIsPlaying(true);

    const loopIndices: Record<string, Record<string, number>> = {};
    sprites.forEach(sprite => {
      loopIndices[sprite.id] = {};
    });

    animationIntervalRef.current = window.setInterval(() => {
      spritesRef.current.forEach(sprite => {
        executeScriptsForSprite(sprite.id, sprite.scripts, loopIndices[sprite.id]);
      });
    }, 100);
  };

  const stopAnimation = () => {
    if (animationIntervalRef.current !== null) {
      clearInterval(animationIntervalRef.current);
      animationIntervalRef.current = null;
    }
    setIsPlaying(false);
  };

  const resetAnimation = () => {
    stopAnimation();
    const resetStates: Record<string, any> = {};
    sprites.forEach(sprite => {
      resetStates[sprite.id] = {
        x: 0,
        y: 0,
        direction: 90,
        sayText: null,
        thinkText: null,
        textTimer: null,
        isThinking: false
      };
    });
    setSpriteStates(resetStates);
  };

  const handleCollision = (spriteId1: string, spriteId2: string) => {
    if (!isPlaying) return;

    const sprite1 = sprites.find(s => s.id === spriteId1);
    const sprite2 = sprites.find(s => s.id === spriteId2);
    if (!sprite1 || !sprite2) return;

    const originalScripts1 = originalScriptsRef.current[spriteId1] || [];
    const originalScripts2 = originalScriptsRef.current[spriteId2] || [];

    const getMotionBlocks = (scripts: Block[]): Block[] => scripts.filter(block => block.category === 'motion');
    const getNonMotionBlocks = (scripts: Block[]): Block[] => scripts.filter(block => block.category !== 'motion');

    const updatedSprite1 = {
      ...sprite1,
      scripts: [...getMotionBlocks(originalScripts2), ...getNonMotionBlocks(originalScripts1)]
    };
    const updatedSprite2 = {
      ...sprite2,
      scripts: [...getMotionBlocks(originalScripts1), ...getNonMotionBlocks(originalScripts2)]
    };

    setSprites(prev => prev.map(s => s.id === spriteId1 ? updatedSprite1 : s.id === spriteId2 ? updatedSprite2 : s));

    // toast(`${sprite1.name} and ${sprite2.name} collided! Motion blocks swapped.`, { duration: 3000 });
  };

  useEffect(() => {
    return () => {
      if (animationIntervalRef.current !== null) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Scratch Swap Studio</h1>
          <div className="flex space-x-2">
            <Button onClick={isPlaying ? stopAnimation : startAnimation} variant={isPlaying ? "outline" : "default"} className="flex items-center">
              {isPlaying ? (<><Pause className="mr-2 h-4 w-4" />Stop</>) : (<><Play className="mr-2 h-4 w-4" />Play</>)}
            </Button>
            <Button onClick={resetAnimation} variant="outline" className="flex items-center">
              <RotateCcw className="mr-2 h-4 w-4" />Reset
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto p-4 grid grid-cols-12 gap-4">
        <div className="col-span-3 bg-white rounded-lg shadow overflow-hidden">
          <Tabs defaultValue="motion">
            <TabsList className="w-full">
              <TabsTrigger value="motion" className="flex-1 bg-motion/10">Motion</TabsTrigger>
              <TabsTrigger value="looks" className="flex-1 bg-looks/10">Looks</TabsTrigger>
              <TabsTrigger value="control" className="flex-1 bg-control/10">Control</TabsTrigger>
            </TabsList>
            <TabsContent value="motion" className="p-4">
              <BlocksList category="motion" onDragStart={() => {}} />
            </TabsContent>
            <TabsContent value="looks" className="p-4">
              <BlocksList category="looks" onDragStart={() => {}} />
            </TabsContent>
            <TabsContent value="control" className="p-4">
              <BlocksList category="control" onDragStart={() => {}} />
            </TabsContent>
          </Tabs>
        </div>
        <div className="col-span-5 flex flex-col">
          <div className="flex-1 min-h-[500px]">
            <CodeWorkspace selectedSpriteId={selectedSpriteId} sprites={sprites} onUpdateSprite={handleUpdateSprite} />
          </div>
        </div>
        <div className="col-span-4 flex flex-col space-y-4">
          <div className="h-[300px] bg-white rounded-lg shadow overflow-hidden">
            <Canvas sprites={sprites} spriteStates={spriteStates} onCollision={handleCollision} isPlaying={isPlaying} />
          </div>
          <SpriteEditor sprites={sprites} selectedSpriteId={selectedSpriteId} onSelectSprite={setSelectedSpriteId} onAddSprite={handleAddSprite} onUpdateSprite={handleUpdateSprite} onDeleteSprite={handleDeleteSprite} />
        </div>
      </main>
      <footer className="bg-white p-4 shadow-inner">
        <div className="container mx-auto text-center text-sm text-gray-500">
          <p>Scratch Swap Studio - A Scratch-like code editor with collision-based animation swapping</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
