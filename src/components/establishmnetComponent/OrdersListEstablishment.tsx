import React from 'react';
import {
  IonList,
  IonItem,
  IonLabel,
  IonText,
  IonBadge,
  IonIcon,
  IonItemSliding,
  IonItemOption,
  IonItemOptions,
} from '@ionic/react';
import { timeOutline, checkmarkCircle, closeCircle } from 'ionicons/icons';
import { Order, OrderStatus } from '../../types/order';
import { 
  formatDate, 
  formatOrderNumber, 
  getNextStatus, 
  getStatusColor, 
  getStatusText, 
  getStatusActionText 
} from './OrderUtils';

interface OrdersListProps {
  orders: Order[];
  onOpenOrderDetail: (order: Order) => void;
  onConfirmStatusUpdate: (order: Order, newStatus: OrderStatus) => void;
}

const OrdersListEstablishment: React.FC<OrdersListProps> = ({
  orders,
  onOpenOrderDetail,
  onConfirmStatusUpdate,
}) => {
  return (
    <IonList>
      {orders.map(order => (
        <IonItemSliding key={order.id}>
          <IonItem onClick={() => onOpenOrderDetail(order)}>
            <IonLabel>
              <h2>Pedido #{formatOrderNumber(order.id!)}</h2>
              <p>
                <IonIcon icon={timeOutline} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                {formatDate(order.createdAt)}
              </p>
              <p>
                <strong>Método de pago:</strong> {order.paymentMethod === 'efectivo' ? 'Efectivo' : 'Tarjeta'}
              </p>
              <p>
                <strong>Total:</strong> ${order.totalAmount.toFixed(2)} •
                <strong> Items:</strong> {order.items.reduce((sum, item) => sum + item.quantity, 0)}
              </p>
              {order.items.length > 0 && (
                <IonText color="medium" style={{ fontSize: '0.8em' }}>
                  {order.items.slice(0, 2).map(item => `${item.quantity}x ${item.name}`).join(', ')}
                  {order.items.length > 2 ? '...' : ''}
                </IonText>
              )}
            </IonLabel>
            <IonBadge color={getStatusColor(order.status)} slot="end">
              {getStatusText(order.status)}
            </IonBadge>
          </IonItem>

          <IonItemOptions side="end">
            {getNextStatus(order.status) && (
              <IonItemOption 
                color="primary" 
                onClick={() => onConfirmStatusUpdate(order, getNextStatus(order.status)!)}
              >
                <IonIcon slot="start" icon={checkmarkCircle} />
                {getStatusActionText(order.status)}
              </IonItemOption>
            )}
            {order.status === OrderStatus.PENDING && (
              <IonItemOption color="danger" onClick={() => onConfirmStatusUpdate(order, OrderStatus.CANCELLED)}>
                <IonIcon slot="start" icon={closeCircle} />
                Cancelar
              </IonItemOption>
            )}
          </IonItemOptions>
        </IonItemSliding>
      ))}
    </IonList>
  );
};

export default OrdersListEstablishment;
