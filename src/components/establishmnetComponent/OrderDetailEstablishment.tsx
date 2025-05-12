import React from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonBadge,
  IonText,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { checkmarkCircle, closeCircle } from 'ionicons/icons';
import { Order, OrderStatus } from '../../types/order';
import { 
  formatDate, 
  formatOrderNumber, 
  calculateTotal,
  getNextStatus, 
  getStatusColor, 
  getStatusText, 
  getStatusActionText 
} from './OrderUtils';

interface OrderDetailProps {
  order: Order;
  onConfirmStatusUpdate: (order: Order, newStatus: OrderStatus) => void;
}

const OrderDetailEstablishment: React.FC<OrderDetailProps> = ({
  order,
  onConfirmStatusUpdate,
}) => {
  return (
    <div className="ion-padding">
      <IonCard>
        <IonCardHeader>
          <IonBadge color={getStatusColor(order.status)}>
            {getStatusText(order.status)}
          </IonBadge>
          <IonCardTitle className="ion-padding-top">
            Pedido #{formatOrderNumber(order.id!)}
          </IonCardTitle>
          <IonText color="medium">
            {formatDate(order.createdAt)}
          </IonText>
        </IonCardHeader>
        <IonCardContent>
          <h2>Detalle de productos</h2>
          <IonList lines="full">
            {order.items.map((item, index) => (
              <IonItem key={index}>
                <IonLabel>
                  <h3>{item.name}</h3>
                  <p>${item.price.toFixed(2)} x {item.quantity}</p>
                </IonLabel>
                <IonText slot="end">${(item.price * item.quantity).toFixed(2)}</IonText>
              </IonItem>
            ))}
            <IonItem>
              <IonLabel>
                <h2>Total</h2>
              </IonLabel>
              <IonText slot="end" color="primary">
                <strong>${calculateTotal(order.items).toFixed(2)}</strong>
              </IonText>
            </IonItem>
          </IonList>

          {order.notes && (
            <div className="ion-padding-top">
              <h2>Notas del cliente</h2>
              <IonCard>
                <IonCardContent>
                  <p>{order.notes}</p>
                </IonCardContent>
              </IonCard>
            </div>
          )}

          {getNextStatus(order.status) && (
            <IonButton
              expand="block"
              className="ion-margin-top"
              onClick={() => onConfirmStatusUpdate(order, getNextStatus(order.status)!)}
            >
              <IonIcon slot="start" icon={checkmarkCircle} />
              {getStatusActionText(order.status)}
            </IonButton>
          )}

          {order.status === OrderStatus.PENDING && (
            <IonButton 
              expand="block" 
              color="danger" 
              className="ion-margin-top"
              onClick={() => onConfirmStatusUpdate(order, OrderStatus.CANCELLED)}
            >
              <IonIcon slot="start" icon={closeCircle} />
              Cancelar pedido
            </IonButton>
          )}
        </IonCardContent>
      </IonCard>
    </div>
  );
};

export default OrderDetailEstablishment; 