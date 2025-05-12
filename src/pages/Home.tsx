import React, {useEffect, useState} from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonToast, IonButtons, IonIcon, IonSearchbar } from '@ionic/react';
import {settings } from 'ionicons/icons';
import EstablishmentListComponent from '../components/EstablishmentListComponent';
import { Establishment } from '../types/establishment';
import { getFirestore, collection, getDocs } from 'firebase/firestore';  //Importacion de librerias necesarias para la ejecución del aplicativo
  

const Home: React.FC = () => {        
  const [searchQuery, setSearchQuery] = useState('');   //Creamos una variable de estado llamada searchQuery para almacenar texto
  const [establishments, setEstablishments] = useState<Establishment[]>([]);

  useEffect(() => {
    const fetchEstablishments = async () => {
      const establishmentsCollection = collection(getFirestore(), 'establishments');
      const snapshot = await getDocs(establishmentsCollection);
      const establishmentsData: Establishment[] = [];
      snapshot.forEach((doc) => {
        establishmentsData.push({ id: doc.id, ...doc.data() } as Establishment);
      });
      setEstablishments(establishmentsData);
    };

    fetchEstablishments();
  }, []);
    
  const handleSearch = (event: CustomEvent) => {
    const query = event.detail.value || '';
    setSearchQuery(query);
  };

  const filteredEstablishments = establishments.filter(establishment => 
    establishment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    establishment.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle class="ion-text-center">Inicio</IonTitle>
          <IonButtons slot="end">
            <IonButton>
              <IonIcon icon={settings} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonSearchbar
          placeholder="Buscar..."
          animated={true}
          onIonInput={handleSearch}
          value={searchQuery}
          style={{
            "--background": "rgba(var(--ion-color-primary-rgb), 0.1)",
            "--border-radius": "10px",
            "--placeholder-color": "var(--ion-color-medium)",
          }}
        />
        <EstablishmentListComponent establishments={filteredEstablishments} />

      </IonContent>
    </IonPage>
  )
};

export default Home;