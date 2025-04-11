
export interface Block {
  id: string;
  type: string;
  category: string;
  params: Record<string, any>;
  children?: Block[];
}
