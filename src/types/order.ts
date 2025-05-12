import { CartItem } from '../components/CartComponent';

export interface Order {
  id?: string;
  userId: string;
  establishmentId: string;
  establishmentName: string;
  items: CartItem[];
  status: OrderStatus;
  totalAmount: number;
  createdAt: Date;
  updatedAt?: Date;
  notes?: string;
  paymentMethod?: string;
  deliveryAddress?: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PREPARATION = 'in_preparation',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
} 