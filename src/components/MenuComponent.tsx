import React, { useState, useEffect } from 'react';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonImg, IonChip, IonText, IonList, IonItem, IonLabel, IonButton, IonGrid, IonRow, IonCol } from '@ionic/react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  available?: boolean;
}

interface MenuCategory {
  id: string;
  name: string;
  establishmentId: string;
}

interface Props {
  categories: MenuCategory[];
}

const MenuComponent: React.FC<Props> = ({ categories }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      const auth = getAuth();
      const db = getFirestore();
      const establishmentId = auth.currentUser?.uid;

    

      try {
        // Obtener IDs de todas las categorías
        const allItems: MenuItem[] = [];
        
        // Para cada categoría, obtener sus items
        for (const category of categories) {
          const itemsQuery = query(
            collection(db, 'menu_items'),
            where('categoryId', '==', category.id)
          );
          
          const itemsSnapshot = await getDocs(itemsQuery);
          
          itemsSnapshot.forEach(doc => {
            allItems.push({ id: doc.id, ...doc.data() } as MenuItem);
          });
        }
        
        setMenuItems(allItems);
        
        if (allItems.length === 0) {
          setError('No hay elementos en el menú');
        }
      } catch (error) {
        console.error('Error al cargar el menú:', error);
        setError(`Error al cargar menú: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMenuItems();
  }, [categories]);

  if (loading) {
    return <div>Cargando menú...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }
  
  if (!categories || categories.length === 0) {
    return <div>No hay categorías de menú definidas</div>;
  }

  if (!menuItems.length) {
    return <div>No hay elementos en el menú</div>;
  }

  return (
    <div className="menu-list">
      {categories.map(category => {
        const categoryItems = menuItems.filter(item => item.categoryId === category.id);
        
        if (categoryItems.length === 0) {
          return null;
        }
        
        return (
          <IonCard key={category.id} className="ion-margin-bottom">
            <IonCardHeader>
              <IonCardTitle>{category.name}</IonCardTitle>
            </IonCardHeader>
            
            <IonCardContent>
              <IonGrid>
                {categoryItems.map(item => (
                  <IonRow key={item.id} className="ion-align-items-center ion-margin-bottom">
                    <IonCol size="3" sizeSm="2">
                      <IonImg 
                        src={item.image} 
                        alt={item.name}
                        style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                    </IonCol>
                    
                    <IonCol size="6" sizeSm="8">
                      <h2 style={{ fontWeight: 'bold', marginBottom: '4px' }}>{item.name}</h2>
                      <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '8px' }}>{item.description}</p>
                      <IonText color="primary" style={{ fontWeight: 'bold' }}>
                        ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                      </IonText>
                      {item.available === false && (
                        <IonChip color="danger" style={{ marginLeft: '8px' }}>
                          No disponible
                        </IonChip>
                      )}
                    </IonCol>
                    
                    <IonCol size="3" sizeSm="2" className="ion-text-end">
                      {item.available !== false && (
                        <IonButton size="small">
                          Agregar
                        </IonButton>
                      )}
                    </IonCol>
                  </IonRow>
                ))}
              </IonGrid>
            </IonCardContent>
          </IonCard>
        );
      })}
    </div>
  );
};

export default MenuComponent; 