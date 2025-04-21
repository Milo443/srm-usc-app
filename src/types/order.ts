export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  establishmentName: string;
  status: 'pending' | 'completed' | 'cancelled';
  date: string;
  items: OrderItem[];
  total: number;
} 