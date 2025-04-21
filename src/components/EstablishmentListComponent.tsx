import React from 'react';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonImg, IonChip, IonIcon, IonText } from '@ionic/react';
import { star } from 'ionicons/icons';
import { Establishment } from '../types/establishment';
import { useHistory } from 'react-router-dom';

interface Props {
  establishments: Establishment[];
}

const EstablishmentListComponent: React.FC<Props> = ({ establishments }) => {
  const history = useHistory();

  const handleClick = (id: string) => {
    history.push(`/establishment/${id}`);
  };

  return (
    <div className="establishment-list ion-padding">
      {establishments.map(establishment => (
        <IonCard key={establishment.id} onClick={() => handleClick(establishment.id)}>
          <IonImg src={establishment.image} alt={establishment.name} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
          <IonCardHeader>
            <IonCardTitle>{establishment.name}</IonCardTitle>
            <IonChip color="primary">
              <IonIcon icon={star} />
              <IonText>{establishment.rating}</IonText>
            </IonChip>
            <IonChip>{establishment.category}</IonChip>
          </IonCardHeader>
          <IonCardContent>
            <p>{establishment.address}</p>
          </IonCardContent>
        </IonCard>
      ))}
    </div>
  );
};

export default EstablishmentListComponent;
