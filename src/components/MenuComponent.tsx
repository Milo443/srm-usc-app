import React from 'react';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonImg, IonChip, IonText, IonList, IonItem, IonLabel, IonButton } from '@ionic/react';
import { MenuItem, MenuCategory } from '../types/menu';

interface Props {
  categories: MenuCategory[];
}

const MenuComponent: React.FC<Props> = ({ categories }) => {
  return (
    <div className="menu-list">
      {categories.map(category => (
        <IonCard key={category.id}>
          <IonCardHeader>
            <IonCardTitle>{category.name}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              {category.items.map(item => (
                <IonItem key={item.id} className="menu-item">
                  <IonImg 
                    src={item.image} 
                    alt={item.name}
                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                  <IonLabel className="ion-padding-start">
                    <h2>{item.name}</h2>
                    <p>{item.description}</p>
                    <IonText color="primary">
                      <h3>${item.price.toFixed(2)}</h3>
                    </IonText>
                    {!item.available && (
                      <IonChip color="danger" style={{ marginTop: '5px' }}>
                        No disponible
                      </IonChip>
                    )}
                  </IonLabel>
                  {item.available && (
                    <IonButton slot="end">
                      Agregar
                    </IonButton>
                  )}
                </IonItem>
              ))}
            </IonList>
          </IonCardContent>
        </IonCard>
      ))}
    </div>
  );
};

export default MenuComponent; 