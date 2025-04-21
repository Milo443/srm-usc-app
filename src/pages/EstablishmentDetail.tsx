import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonImg, IonButton, IonIcon, IonText, IonChip, IonBackButton, IonButtons, IonSpinner } from '@ionic/react';
import { star, call, location } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import { Establishment } from '../types/establishment';
import { MenuCategory } from '../types/menu';
import MenuComponent from '../components/MenuComponent';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const EstablishmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener datos del establecimiento
        const establishmentDoc = await getDoc(doc(db, 'establishments', id));
        if (establishmentDoc.exists()) {
          setEstablishment(establishmentDoc.data() as Establishment);
        }

        // Obtener categorías del menú
        const menuQuery = query(
          collection(db, 'menu_categories'),
          where('establishmentId', '==', id)
        );
        const menuSnapshot = await getDocs(menuQuery);
        const categories: MenuCategory[] = [];
        
        menuSnapshot.forEach((doc) => {
          categories.push({ id: doc.id, ...doc.data() } as MenuCategory);
        });

        setMenuCategories(categories);
      } catch (error) {
        console.error('Error al cargar los datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, db]);

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <IonSpinner />
          <p>Cargando información...</p>
        </IonContent>
      </IonPage>
    );
  }

  if (!establishment) {
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <p>Establecimiento no encontrado</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>{establishment.name}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonImg src={establishment.image} alt={establishment.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
        
        <div className="ion-padding">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>{establishment.name}</IonCardTitle>
              <IonChip color="primary">
                <IonIcon icon={star} />
                <IonText>{establishment.rating}</IonText>
              </IonChip>
              <IonChip>{establishment.category}</IonChip>
            </IonCardHeader>
            
            <IonCardContent>
              <p>{establishment.description}</p>
              
              <IonButton fill="clear" href={`tel:${establishment.phone}`}>
                <IonIcon slot="start" icon={call} />
                {establishment.phone}
              </IonButton>
              
              <IonButton fill="clear">
                <IonIcon slot="start" icon={location} />
                {establishment.address}
              </IonButton>
            </IonCardContent>
          </IonCard>

          {menuCategories.length > 0 ? (
            <MenuComponent categories={menuCategories} />
          ) : (
            <IonCard>
              <IonCardContent className="ion-text-center">
                <p>Este establecimiento aún no tiene menú disponible</p>
              </IonCardContent>
            </IonCard>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default EstablishmentDetail; 