import React from 'react';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet } from '@ionic/react';
import { Route, Redirect } from 'react-router';
import { home, person, calendar, restaurant, cube, speedometer } from 'ionicons/icons';
import HomeEstablishmnet from '../../pages/Establishment/HomeEstablishmnet';


import Profile from '../../pages/common/profile';
import Menu from '../../pages/Establishment/Menu';
import OrdersEstablishment from '../../pages/Establishment/OrdersEstablishment';


// Páginas



const TabsLayoutEstablishmnet: React.FC = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/app/establishment/home">
          <HomeEstablishmnet />
        </Route>

        <Route exact path="/app/establishment/menu">
          <Menu />
        </Route>

        <Route exact path="/app/establishment/orders">
          <OrdersEstablishment />
        </Route>

        <Route exact path="/app/establishment/reports">
          {/* <Reports /> */}
        </Route>

        <Route exact path="/app/establishment/profile">
          <Profile />
        </Route>

        <Route exact path="/app/establishment">
          <Redirect to="/app/establishment/home" />
        </Route>
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        <IonTabButton tab="home" href="/app/establishment/home">
          <IonIcon icon={speedometer} />
          <IonLabel>Panel</IonLabel>
        </IonTabButton>

        <IonTabButton tab="menu" href="/app/establishment/menu">
          <IonIcon icon={restaurant} />
          <IonLabel>Menú</IonLabel>
        </IonTabButton>

        <IonTabButton tab="orders" href="/app/establishment/orders">
          <IonIcon icon={cube} />
          <IonLabel>Pedidos</IonLabel>
        </IonTabButton>

        <IonTabButton tab="profile" href="/app/establishment/profile">
          <IonIcon icon={person} />
          <IonLabel>Perfil</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default TabsLayoutEstablishmnet; 