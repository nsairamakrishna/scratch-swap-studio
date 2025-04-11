
import { Block } from './block';

export interface Sprite {
  id: string;
  name: string;
  color: string;
  width: number;
  height: number;
  shape: string;
  image?: string;
  scripts: Block[];
}
