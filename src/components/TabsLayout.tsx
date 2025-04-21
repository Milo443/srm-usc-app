import React from 'react';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet } from '@ionic/react';
import { Route, Redirect } from 'react-router';
import { home, person, calendar, restaurant, cube } from 'ionicons/icons';

// Páginas
import Home from '../pages/Home';
import Profile from '../pages/profile';
import Orders from '../pages/Orders';
const TabsLayout: React.FC = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>

        <Route exact path="/app/profile">
          <Profile />
        </Route>

        <Route exact path="/app/orders">
          <Orders />
        </Route>

        <Route exact path="/app/home">
          <Home />
        </Route>
        <Route exact path="/app">
          <Redirect to="/app/home" />
        </Route>
      </IonRouterOutlet>

      <IonTabBar slot="bottom">
        <IonTabButton tab="home" href="/app/home">
          <IonIcon icon={home} />
          <IonLabel>Inicio</IonLabel>
        </IonTabButton>

        {/* <IonTabButton tab="menu" href="/app/menu">
          <IonIcon icon={restaurant} />
          <IonLabel>Menú</IonLabel>
        </IonTabButton> */}

        <IonTabButton tab="orders" href="/app/orders">
          <IonIcon icon={cube} />
          <IonLabel>Pedidos</IonLabel>
        </IonTabButton>

        <IonTabButton tab="profile" href="/app/profile">

          <IonIcon icon={person} />
          <IonLabel>Perfil</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default TabsLayout; 