import React, { useEffect } from 'react';
import { IonContent, IonPage} from '@ionic/react';
import { useHistory } from 'react-router-dom';

const ScreenSplash: React.FC = () => {
  const history = useHistory();
  useEffect(() => {
    setTimeout(() => {
      history.push('/login');
    }, 3000);
  }, [history]);
  
  return (
    <IonPage>
      <IonContent className="ion-padding">

        <div className="splash-container">
            <img src="/assets/images/logo.png" alt="Logo" className="splash-logo" />
            <h2 className="splash-title">Bienvenido a la app de gestión de pedidos USC</h2>
            <p className="splash-description">La app de gestión de pedidos USC</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ScreenSplash;
