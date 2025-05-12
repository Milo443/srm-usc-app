import { OrderStatus } from '../../types/order';
import { CartItem } from '../CartComponent';

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatOrderNumber = (orderId: string) => {
  return orderId.substring(0, 6).toUpperCase();
};

export const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

export const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
  switch (currentStatus) {
    case OrderStatus.PENDING:
      return OrderStatus.CONFIRMED;
    case OrderStatus.CONFIRMED:
      return OrderStatus.IN_PREPARATION;
    case OrderStatus.IN_PREPARATION:
      return OrderStatus.READY;
    case OrderStatus.READY:
      return OrderStatus.DELIVERED;
    default:
      return null;
  }
};

export const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'warning';
    case OrderStatus.CONFIRMED:
      return 'primary';
    case OrderStatus.IN_PREPARATION:
      return 'primary';
    case OrderStatus.READY:
      return 'success';
    case OrderStatus.DELIVERED:
      return 'success';
    case OrderStatus.CANCELLED:
      return 'danger';
    default:
      return 'medium';
  }
};

export const getStatusText = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return 'Pendiente';
    case OrderStatus.CONFIRMED:
      return 'Confirmada';
    case OrderStatus.IN_PREPARATION:
      return 'En preparación';
    case OrderStatus.READY:
      return 'Lista';
    case OrderStatus.DELIVERED:
      return 'Entregada';
    case OrderStatus.CANCELLED:
      return 'Cancelada';
    default:
      return status;
  }
};

export const getNextStatusText = (currentStatus: OrderStatus): string => {
  const nextStatus = getNextStatus(currentStatus);
  if (!nextStatus) return '';
  return `${getStatusText(nextStatus)}`;
};

export const getStatusActionText = (currentStatus: OrderStatus): string => {
  switch (currentStatus) {
    case OrderStatus.PENDING:
      return 'Confirmar orden';
    case OrderStatus.CONFIRMED:
      return 'Iniciar preparación';
    case OrderStatus.IN_PREPARATION:
      return 'Marcar como lista';
    case OrderStatus.READY:
      return 'Marcar como entregada';
    default:
      return '';
  }
}; 