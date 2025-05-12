import React, { useEffect, useState } from 'react';
import { 
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonGrid, IonRow, IonCol, IonBadge, IonList, IonItem, IonLabel, IonImg} from '@ionic/react';
import { settings, calendar, people, time, star, notifications} from 'ionicons/icons';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface Reservation {
  id: string;
  userId: string;
  userName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  people: number;
}

const HomeEstablishment: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [establishmentData, setEstablishmentData] = useState<any>(null);
  const [stats, setStats] = useState({
    totalReservations: 0,
    pendingReservations: 0,
    todayReservations: 0
  });

  useEffect(() => {
    const fetchEstablishmentData = async () => {
      const auth = getAuth();
      const db = getFirestore();
      
      if (auth.currentUser) {
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
        
        const snapshot = await getDocs(reservationsQuery);
        const reservationsData: Reservation[] = [];
        
        snapshot.forEach((doc) => {
          reservationsData.push({ id: doc.id, ...doc.data() } as Reservation);
        });

        setReservations(reservationsData);

        // Calcular estadísticas
        const today = new Date().toISOString().split('T')[0];
        setStats({
          totalReservations: reservationsData.length,
          pendingReservations: reservationsData.filter(r => r.status === 'pending').length,
          todayReservations: reservationsData.filter(r => r.date === today).length
        });
      }
    };

    fetchEstablishmentData();
  }, []);

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

        {/* Estadísticas */}
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonCard>
                <IonCardContent>
                  <IonIcon icon={people} size="large" />
                  <h3>{stats.totalReservations}</h3>
                  <p>Total Reservaciones</p>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol>
              <IonCard>
                <IonCardContent>
                  <IonIcon icon={time} size="large" />
                  <h3>{stats.pendingReservations}</h3>
                  <p>Pendientes</p>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol>
              <IonCard>
                <IonCardContent>
                  <IonIcon icon={calendar} size="large" />
                  <h3>{stats.todayReservations}</h3>
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