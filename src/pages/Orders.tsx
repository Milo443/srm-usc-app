import React from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import OrderListComponent from '../components/OrderListComponent';
import { Order } from '../types/order';

// Datos de ejemplo
const orders: Order[] = [
  {
    id: "1",
    establishmentName: "Restaurante El Buen Sabor",
    status: "pending",
    date: new Date().toISOString(),
    items: [
      {
        name: "Hamburguesa",
        quantity: 2,
        price: 10.99
      },
      {
        name: "Papas Fritas",
        quantity: 1,
        price: 4.99  
      }
    ],
    total: 26.97
  },
  {
    id: "2", 
    establishmentName: "La Casa del Sabor",
    status: "completed",
    date: new Date().toISOString(),
    items: [
      {
        name: "Pizza Familiar",
        quantity: 1,
        price: 24.99
      }
    ],
    total: 24.99
  }
];

const Orders: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="ion-text-center">Mis Pedidos</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <OrderListComponent orders={orders} />
      </IonContent>
    </IonPage>
  );
};

export default Orders;
