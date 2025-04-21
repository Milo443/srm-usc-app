import React from 'react';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBadge } from '@ionic/react';

interface Order {
  id: string;
  establishmentName: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  date: string;
}

interface Props {
  orders: Order[];
}

const OrderListComponent: React.FC<Props> = ({ orders }) => {
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'medium';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'confirmed':
        return 'Confirmado';
      case 'completed':
        return 'Completado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  return (
    <div className="order-list ion-padding">
      {orders.map(order => (
        <IonCard key={order.id}>
          <IonCardHeader>
            <IonCardTitle>{order.establishmentName}</IonCardTitle>
            <IonBadge color={getStatusColor(order.status)}>
              {getStatusText(order.status)}
            </IonBadge>
          </IonCardHeader>
          <IonCardContent>
            <p className="order-date">{new Date(order.date).toLocaleDateString()}</p>
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <span>{item.quantity}x {item.name}</span>
                <span>${item.price.toFixed(2)}</span>
              </div>
            ))}
            <div className="order-total">
              <strong>Total: ${order.total.toFixed(2)}</strong>
            </div>
          </IonCardContent>
        </IonCard>
      ))}
    </div>
  );
};

export default OrderListComponent;
