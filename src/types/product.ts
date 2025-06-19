
export interface Product {
  id: string;
  name: string;
  category: string;
  dimensions: string;
  image: string;
  modelType: 'box' | 'sphere' | 'cone';
  modelColor: string;
  description: string;
  specifications: string[];
}
