import React, { useEffect, useState } from 'react';
import { 
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonGrid, IonRow, IonCol, IonBadge, IonList, IonItem, IonLabel, IonImg, IonSpinner} from '@ionic/react';
import { settings, calendar, people, time, star, notifications, restaurant, calculator, today, hourglass } from 'ionicons/icons';
import { getFirestore, collection, query, where, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { OrderStatus } from '../../types/order';

interface Reservation {
  id: string;
  userId: string;
  userName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  people: number;
}

interface Order {
  id?: string;
  status: string;
  createdAt: Date | Timestamp;
}

const HomeEstablishment: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [establishmentData, setEstablishmentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReservations: 0,
    pendingReservations: 0,
    todayReservations: 0,
    totalOrders: 0,
    pendingOrders: 0,
    todayOrders: 0
  });

  useEffect(() => {
    const fetchEstablishmentData = async () => {
      setLoading(true);
      const auth = getAuth();
      const db = getFirestore();
      
      if (auth.currentUser) {
        try {
          // Obtener datos del establecimiento
          const establishmentDoc = await getDoc(doc(db, 'establishments', auth.currentUser.uid));
          if (establishmentDoc.exists()) {
            setEstablishmentData(establishmentDoc.data());
          }

          // Obtener reservaciones
          const reservationsQuery = query(
            collection(db, 'reservations'),
            where('establishmentId', '==', auth.currentUser.uid)
          );
          
          const reservationsSnapshot = await getDocs(reservationsQuery);
          const reservationsData: Reservation[] = [];
          
          reservationsSnapshot.forEach((doc) => {
            reservationsData.push({ id: doc.id, ...doc.data() } as Reservation);
          });

          setReservations(reservationsData);

          // Obtener órdenes
          const ordersQuery = query(
            collection(db, 'orders'),
            where('establishmentId', '==', auth.currentUser.uid)
          );
          
          const ordersSnapshot = await getDocs(ordersQuery);
          const ordersData: Order[] = [];
          
          ordersSnapshot.forEach((doc) => {
            const data = doc.data();
            // Convertir Timestamp a Date si es necesario
            let createdAt: Date;
            if (data.createdAt instanceof Timestamp) {
              createdAt = data.createdAt.toDate();
            } else if (data.createdAt) {
              createdAt = new Date(data.createdAt);
            } else {
              createdAt = new Date();
            }
            
            ordersData.push({ 
              id: doc.id, 
              status: data.status || OrderStatus.PENDING,
              createdAt: createdAt
            });
          });
          
          setOrders(ordersData);

          // Calcular estadísticas de reservaciones
          const today = new Date().toISOString().split('T')[0];
          
          // Calcular estadísticas de órdenes
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);
          
          const todayOrders = ordersData.filter(order => {
            const orderDate = order.createdAt instanceof Date 
              ? order.createdAt 
              : order.createdAt.toDate();
            return orderDate >= startOfToday;
          });
          
          const pendingOrders = ordersData.filter(order => 
            order.status === OrderStatus.PENDING
          );
          
          // Actualizar todas las estadísticas
          setStats({
            totalReservations: reservationsData.length,
            pendingReservations: reservationsData.filter(r => r.status === 'pending').length,
            todayReservations: reservationsData.filter(r => r.date === today).length,
            totalOrders: ordersData.length,
            pendingOrders: pendingOrders.length,
            todayOrders: todayOrders.length
          });
          
        } catch (error) {
          console.error("Error al cargar datos:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchEstablishmentData();
  }, []);

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle class="ion-text-center">Panel de Control</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding ion-text-center">
          <IonSpinner />
          <p>Cargando información...</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle class="ion-text-center">Panel de Control</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="">
        {/* Información del Establecimiento */}
        <IonImg src={establishmentData?.image} alt={establishmentData?.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />

        <IonCard>
            
          <IonCardHeader>
            <IonCardTitle>{establishmentData?.name}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p><strong>Dirección:</strong> {establishmentData?.address}</p>
            <p><strong>Teléfono:</strong> {establishmentData?.phone}</p>
            <p><strong>Categoría:</strong> {establishmentData?.category}</p>
          </IonCardContent>
        </IonCard>

       

        {/* Estadísticas de Órdenes */}
        <IonCardHeader>
          <IonCardTitle>Pedidos</IonCardTitle>
        </IonCardHeader>
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonCard>
                <IonCardContent className="ion-text-center">
                  <IonIcon icon={calculator} color="primary" size="large" />
                  <h3>{stats.totalOrders}</h3>
                  <p>Total</p>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol>
              <IonCard>
                <IonCardContent className="ion-text-center">
                  <IonIcon icon={hourglass} color="warning" size="large" />
                  <h3>{stats.pendingOrders}</h3>
                  <p>Pendientes</p>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol>
              <IonCard>
                <IonCardContent className="ion-text-center">
                  <IonIcon icon={today} color="success" size="large" />
                  <h3>{stats.todayOrders}</h3>
                  <p>Hoy</p>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default HomeEstablishment;