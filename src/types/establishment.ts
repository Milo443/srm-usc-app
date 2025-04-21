import { MenuCategory } from "./menu";

export interface Establishment {
  id: string;
  name: string;
  address: string;
  image: string;
  rating: number;
  category: string;
  description: string;
  phone: string;
  menuCategories: MenuCategory[];
  

} 