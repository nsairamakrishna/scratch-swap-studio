import { useRef, useEffect } from 'react';
import { Sprite } from '@/types/sprite';

interface CanvasProps {
  sprites: Sprite[];
  spriteStates: Record<string, {
    x: number;
    y: number;
    direction: number;
    sayText: string | null;
    thinkText: string | null;
    textTimer: number | null;
    isThinking: boolean;
  }>;
  onCollision: (spriteId1: string, spriteId2: string) => void;
  isPlaying: boolean;
}

const Canvas: React.FC<CanvasProps> = ({ sprites, spriteStates, onCollision, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const prevTimeRef = useRef<number>(0);
  
  // Draw the entire canvas
  const drawCanvas = (ctx: CanvasRenderingContext2D) => {
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines (light)
    ctx.strokeStyle = '#e5e5e5';
    ctx.lineWidth = 1;
    
    // Draw vertical grid lines
    for (let x = 0; x <= canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Draw horizontal grid lines
    for (let y = 0; y <= canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Draw center lines
    ctx.strokeStyle = '#a5a5a5';
    ctx.lineWidth = 2;
    
    // Vertical center line
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    
    // Horizontal center line
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    
    // Draw sprites - always render sprites, not dependent on isPlaying
    sprites.forEach(sprite => {
      const state = spriteStates[sprite.id];
      if (!state) return;
      
      // Save context state
      ctx.save();
      
      // Translate to sprite position (canvas center is 0,0)
      const canvasCenterX = canvas.width / 2;
      const canvasCenterY = canvas.height / 2;
      
      ctx.translate(canvasCenterX + state.x, canvasCenterY - state.y);
      
      // Rotate based on direction (0 degrees is up)
      const rotationInRadians = ((90 - state.direction) * Math.PI) / 180;
      ctx.rotate(rotationInRadians);
      
      // Draw sprite
      if (sprite.image) {
        // Draw image if available
        const img = new Image();
        img.src = sprite.image;
        ctx.drawImage(img, -sprite.width / 2, -sprite.height / 2, sprite.width, sprite.height);
      } else {
        // Draw a colored rectangle as fallback
        ctx.fillStyle = sprite.color;
        ctx.fillRect(-sprite.width / 2, -sprite.height / 2, sprite.width, sprite.height);
      }
      
      // Restore context to previous state
      ctx.restore();
      
      // Draw speech or thought bubbles
      if (state.sayText || state.thinkText) {
        drawTextBubble(
          ctx, 
          canvasCenterX + state.x, 
          canvasCenterY - state.y - sprite.height/2 - 20, 
          state.isThinking ? state.thinkText! : state.sayText!, 
          state.isThinking
        );
      }
    });
    
    // Check for collisions only when playing
    if (isPlaying) {
      checkCollisions();
    }
  };
  
  // Draw speech or thought bubble
  const drawTextBubble = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    text: string, 
    isThought: boolean
  ) => {
    const padding = 10;
    const cornerRadius = 6;
    const maxWidth = 150;
    
    // Set text properties
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Measure text
    const textWidth = Math.min(ctx.measureText(text).width, maxWidth);
    const textHeight = 20;
    
    // Calculate bubble dimensions
    const bubbleWidth = textWidth + padding * 2;
    const bubbleHeight = textHeight + padding * 2;
    
    // Calculate bubble position
    const bubbleX = x - bubbleWidth / 2;
    const bubbleY = y - bubbleHeight;
    
    // Draw bubble
    ctx.fillStyle = 'white';
    ctx.beginPath();
    
    if (isThought) {
      // Draw thought bubble (rounded rectangle)
      ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, cornerRadius);
      
      // Draw thought circles
      const circles = [
        { x: x, y: y + 5, radius: 4 },
        { x: x - 5, y: y + 14, radius: 3 },
        { x: x - 10, y: y + 20, radius: 2 }
      ];
      
      circles.forEach(circle => {
        ctx.moveTo(circle.x + circle.radius, circle.y);
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
      });
    } else {
      // Draw speech bubble (rounded rectangle)
      ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, cornerRadius);
      
      // Draw pointer
      ctx.moveTo(x - 10, y);
      ctx.lineTo(x, y + 10);
      ctx.lineTo(x + 10, y);
    }
    
    ctx.fill();
    
    // Draw text
    ctx.fillStyle = 'black';
    ctx.fillText(text, x, bubbleY + bubbleHeight / 2, maxWidth);
  };
  
  // Check for sprite collisions
  const checkCollisions = () => {
    // Basic bounding box collision detection
    for (let i = 0; i < sprites.length; i++) {
      for (let j = i + 1; j < sprites.length; j++) {
        const sprite1 = sprites[i];
        const sprite2 = sprites[j];
        const state1 = spriteStates[sprite1.id];
        const state2 = spriteStates[sprite2.id];
        
        if (!state1 || !state2) continue;
        
        const canvasEl = canvasRef.current;
        if (!canvasEl) continue;
        
        const canvasCenterX = canvasEl.width / 2;
        const canvasCenterY = canvasEl.height / 2;
        
        // Get sprite screen positions
        const sprite1X = canvasCenterX + state1.x;
        const sprite1Y = canvasCenterY - state1.y;
        const sprite2X = canvasCenterX + state2.x;
        const sprite2Y = canvasCenterY - state2.y;
        
        // Check for bounding box overlap
        const sprite1Left = sprite1X - sprite1.width / 2;
        const sprite1Right = sprite1X + sprite1.width / 2;
        const sprite1Top = sprite1Y - sprite1.height / 2;
        const sprite1Bottom = sprite1Y + sprite1.height / 2;
        
        const sprite2Left = sprite2X - sprite2.width / 2;
        const sprite2Right = sprite2X + sprite2.width / 2;
        const sprite2Top = sprite2Y - sprite2.height / 2;
        const sprite2Bottom = sprite2Y + sprite2.height / 2;
        
        // Check if bounding boxes overlap
        if (
          sprite1Right > sprite2Left &&
          sprite1Left < sprite2Right &&
          sprite1Bottom > sprite2Top &&
          sprite1Top < sprite2Bottom
        ) {
          // Collision detected
          onCollision(sprite1.id, sprite2.id);
        }
      }
    }
  };
  
  // Animation loop
  const animate = (timestamp: number) => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // Calculate elapsed time since last frame
    const deltaTime = timestamp - (prevTimeRef.current || timestamp);
    prevTimeRef.current = timestamp;
    
    // Update text timers
    if (isPlaying) {
      for (const spriteId in spriteStates) {
        const state = spriteStates[spriteId];
        if (state.textTimer !== null && state.textTimer > 0) {
          state.textTimer -= deltaTime / 1000; // Convert ms to seconds
          if (state.textTimer <= 0) {
            state.textTimer = null;
            state.sayText = null;
            state.thinkText = null;
          }
        }
      }
    }
    
    // Draw the canvas
    drawCanvas(ctx);
    
    // Continue animation loop
    animationFrameRef.current = requestAnimationFrame(animate);
  };
  
  // Set up canvas and start animation loop
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Adjust canvas for high-DPI displays
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
      
      // Start animation loop
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    
    // Clean up on unmount
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [sprites, spriteStates, isPlaying]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full bg-slate-50 shadow-inner"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default Canvas;
