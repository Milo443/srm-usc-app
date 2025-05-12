import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonImg, IonButton, IonIcon, IonText, IonChip, 
  IonBackButton, IonButtons, IonSpinner, IonBadge, IonList, IonItem, IonLabel, IonGrid, 
  IonRow, IonCol, IonAlert } from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Order, OrderStatus } from '../types/order';
import { timeOutline, storefront, call } from 'ionicons/icons';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorAlert, setErrorAlert] = useState(false);
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const loadOrder = async () => {
      if (!auth.currentUser) {
        history.push('/login?redirect=/orders/' + id);
        return;
      }

      try {
        setLoading(true);
        const orderDoc = await getDoc(doc(db, 'orders', id));
        
        if (!orderDoc.exists()) {
          setErrorAlert(true);
          return;
        }
        
        const orderData = orderDoc.data();
        setOrder({
          id: orderDoc.id,
          ...orderData,
          createdAt: orderData.createdAt.toDate(),
          updatedAt: orderData.updatedAt ? orderData.updatedAt.toDate() : undefined
        } as Order);
      } catch (error) {
        console.error('Error al cargar la orden:', error);
        setErrorAlert(true);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, db, auth, history]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'warning';
      case OrderStatus.CONFIRMED:
      case OrderStatus.IN_PREPARATION:
        return 'primary';
      case OrderStatus.READY:
      case OrderStatus.DELIVERED:
        return 'success';
      case OrderStatus.CANCELLED:
        return 'danger';
      default:
        return 'medium';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Pendiente';
      case OrderStatus.CONFIRMED:
        return 'Confirmada';
      case OrderStatus.IN_PREPARATION:
        return 'En preparación';
      case OrderStatus.READY:
        return 'Lista para recoger';
      case OrderStatus.DELIVERED:
        return 'Entregada';
      case OrderStatus.CANCELLED:
        return 'Cancelada';
      default:
        return status;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/orders" />
            </IonButtons>
            <IonTitle>Detalles de la orden</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding ion-text-center">
          <IonSpinner />
          <p>Cargando detalles...</p>
        </IonContent>
      </IonPage>
    );
  }

  if (!order) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/orders" />
            </IonButtons>
            <IonTitle>Detalles de la orden</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding ion-text-center">
          <p>No se encontró la orden o no tienes permiso para verla</p>
          <IonButton routerLink="/orders">Ver mis pedidos</IonButton>
        </IonContent>
        <IonAlert
          isOpen={errorAlert}
          onDidDismiss={() => setErrorAlert(false)}
          header="Error"
          message="No se pudo cargar la información de la orden. Por favor, intenta nuevamente."
          buttons={['OK']}
        />
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/orders" />
          </IonButtons>
          <IonTitle>Detalles de la orden</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonBadge color={getStatusColor(order.status)} style={{ marginBottom: '8px' }}>
              {getStatusText(order.status)}
            </IonBadge>
            <IonCardTitle>Pedido #{order.id!.substring(0, 6)}</IonCardTitle>
            <IonText color="medium">
              <p>
                <IonIcon icon={timeOutline} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                {formatDate(order.createdAt)}
              </p>
            </IonText>
          </IonCardHeader>
          
          <IonCardContent>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center' }}>
                <IonIcon icon={storefront} style={{ marginRight: '8px' }} />
                {order.establishmentName}
              </h3>
              {order.status === OrderStatus.CONFIRMED && (
                <IonButton size="small" fill="clear" href="tel:+123456789">
                  <IonIcon icon={call} slot="start" />
                  Llamar al establecimiento
                </IonButton>
              )}
            </div>
            
            <IonList lines="none">
              <IonItem style={{ '--background': 'var(--ion-color-light)', '--border-radius': '8px' }}>
                <IonLabel>
                  <h2 style={{ fontWeight: 'bold' }}>Resumen del pedido</h2>
                </IonLabel>
              </IonItem>
              
              {order.items.map((item, index) => (
                <IonItem key={index}>
                  <IonGrid>
                    <IonRow>
                      <IonCol size="8">
                        <IonText>
                          <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                          {item.notes && <p style={{ fontSize: '0.8em', color: '#666' }}>{item.notes}</p>}
                        </IonText>
                      </IonCol>
                      <IonCol size="2" className="ion-text-center">
                        x{item.quantity}
                      </IonCol>
                      <IonCol size="2" className="ion-text-end">
                        ${(item.price * item.quantity).toFixed(2)}
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonItem>
              ))}
              
              <IonItem lines="full">
                <IonLabel slot="start">Total</IonLabel>
                <IonText slot="end" color="dark">
                  <span style={{ fontWeight: 'bold', fontSize: '1.2em' }}>
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </IonText>
              </IonItem>
            </IonList>
            
            {order.notes && (
              <div style={{ marginTop: '16px' }}>
                <h3>Notas</h3>
                <p>{order.notes}</p>
              </div>
            )}
            
            {order.status === OrderStatus.PENDING && (
              <IonButton expand="block" color="danger" style={{ marginTop: '16px' }}>
                Cancelar Pedido
              </IonButton>
            )}
            
            {order.status === OrderStatus.READY && (
              <div className="ion-text-center" style={{ marginTop: '16px' }}>
                <IonText color="success">
                  <h3>¡Tu pedido está listo para recoger!</h3>
                </IonText>
                <p>Dirígete al establecimiento para recoger tu pedido.</p>
              </div>
            )}
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default OrderDetail; 