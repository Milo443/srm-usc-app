import React, { useState } from 'react';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon, IonItem, IonLabel, IonList, IonBadge, IonText, IonGrid, IonRow, IonCol, IonRadioGroup, IonRadio, IonListHeader } from '@ionic/react';
import { cartOutline, add, remove, trashOutline, cardOutline, cashOutline } from 'ionicons/icons';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

interface CartProps {
  items: CartItem[];
  establishmentId: string;
  establishmentName: string;
  onIncreaseQuantity: (itemId: string) => void;
  onDecreaseQuantity: (itemId: string) => void;
  onRemoveItem: (itemId: string) => void;
  onStartOrder: (paymentMethod: string) => void;
}

const CartComponent: React.FC<CartProps> = ({
  items,
  establishmentId,
  establishmentName,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveItem,
  onStartOrder
}) => {
  const [paymentMethod, setPaymentMethod] = useState<string>('efectivo');
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (items.length === 0) {
    return (
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Carrito de compra</IonCardTitle>
        </IonCardHeader>
        <IonCardContent className="ion-text-center">
          <IonIcon icon={cartOutline} style={{ fontSize: '48px', color: '#ccc' }} />
          <p>Tu carrito está vacío</p>
        </IonCardContent>
      </IonCard>
    );
  }

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>
          Carrito de compra
          <IonBadge color="primary" style={{ marginLeft: '8px' }}>{totalItems}</IonBadge>
        </IonCardTitle>
        <IonText color="medium">{establishmentName}</IonText>
      </IonCardHeader>
      
      <IonCardContent>
        <IonList>
          {items.map(item => (
            <IonItem key={item.id}>
              <IonGrid>
                <IonRow className="ion-align-items-center">
                  <IonCol size="6">
                    <IonLabel>
                      <h3>{item.name}</h3>
                      <p>${item.price.toFixed(2)}</p>
                    </IonLabel>
                  </IonCol>
                  
                  <IonCol size="4" className="ion-text-center">
                    <IonButton fill="clear" size="small" onClick={() => onDecreaseQuantity(item.id)}>
                      <IonIcon icon={remove} />
                    </IonButton>
                    
                    <IonText style={{ margin: '0 8px' }}>{item.quantity}</IonText>
                    
                    <IonButton fill="clear" size="small" onClick={() => onIncreaseQuantity(item.id)}>
                      <IonIcon icon={add} />
                    </IonButton>
                  </IonCol>
                  
                  <IonCol size="2" className="ion-text-end">
                    <IonButton fill="clear" color="danger" onClick={() => onRemoveItem(item.id)}>
                      <IonIcon icon={trashOutline} />
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonItem>
          ))}
        </IonList>

        <IonList>
          <IonListHeader>
            <IonLabel>Método de Pago</IonLabel>
          </IonListHeader>
          <IonRadioGroup value={paymentMethod} onIonChange={e => setPaymentMethod(e.detail.value)}>
            <IonItem>
              <IonIcon icon={cashOutline} slot="start" />
              <IonLabel>Efectivo</IonLabel>
              <IonRadio value="efectivo" />
            </IonItem>
            <IonItem>
              <IonIcon icon={cardOutline} slot="start" />
              <IonLabel>Tarjeta de Crédito/Débito</IonLabel>
              <IonRadio value="tarjeta" />
            </IonItem>
          </IonRadioGroup>
        </IonList>
        
        <div className="ion-padding ion-text-end">
          <IonText color="dark">
            <h2>Total: ${totalPrice.toFixed(2)}</h2>
          </IonText>
          
          <IonButton expand="block" onClick={() => onStartOrder(paymentMethod)}>
            Iniciar Orden
          </IonButton>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default CartComponent; 