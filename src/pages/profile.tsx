import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem, IonLabel, IonButton, IonList, 
  IonAvatar, IonIcon, IonText, IonInput, IonToast } from '@ionic/react';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useHistory } from 'react-router-dom';
import { personCircle, logOut, save, pencil } from 'ionicons/icons';

const Profile: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const history = useHistory();
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setEditedData(data);
          }
        } catch (error) {
          console.error('Error al obtener datos del usuario:', error);
          showToastMessage('Error al cargar los datos');
        }
      }
    };

    fetchUserData();
  }, [auth.currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      sessionStorage.clear();
      history.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      showToastMessage('Error al cerrar sesión');
    }
  };

  const handleSaveChanges = async () => {
    if (!auth.currentUser) return;

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        name: editedData.name,
        phone: editedData.phone,
        address: editedData.address
      });

      setUserData(editedData);
      setIsEditing(false);
      showToastMessage('Datos actualizados correctamente');
    } catch (error) {
      console.error('Error al actualizar datos:', error);
      showToastMessage('Error al actualizar los datos');
    }
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mi Perfil</IonTitle>
          {userData && (
            <IonButton 
              slot="end" 
              fill="clear"
              onClick={() => isEditing ? handleSaveChanges() : setIsEditing(true)}
            >
              <IonIcon slot="icon-only" icon={isEditing ? save : pencil} />
            </IonButton>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="ion-text-center ion-padding">
          <IonAvatar style={{ width: '120px', height: '120px', margin: '0 auto' }}>
            <IonIcon icon={personCircle} size="large" style={{ width: '100%', height: '100%' }} />
          </IonAvatar>
        </div>

        {userData && (
          <IonList>
            <IonItem>
              {isEditing ? (
                <IonInput
                  label="Nombre"
                  labelPlacement="floating"
                  value={editedData.name}
                  onIonInput={e => setEditedData({...editedData, name: e.detail.value})}
                  style={{
                    "--background": "rgba(var(--ion-color-primary-rgb), 0.1)",
                    "--border-color": "var(--ion-color-primary)",
                    "--border-width": "2px",
                    "--border-style": "dashed"
                  }}
                />
              ) : (
                <IonLabel>
                  <h2>Nombre</h2>
                  <IonText>{userData.name}</IonText>
                </IonLabel>
              )}
            </IonItem>

            <IonItem>
              <IonLabel>
                <h2>Correo</h2>
                <IonText>{userData.email}</IonText>
              </IonLabel>
            </IonItem>

            <IonItem>
              {isEditing ? (
                <IonInput
                  label="Teléfono"
                  labelPlacement="floating"
                  value={editedData.phone}
                  onIonInput={e => setEditedData({...editedData, phone: e.detail.value})}
                  style={{
                    "--background": "rgba(var(--ion-color-primary-rgb), 0.1)",
                    "--border-color": "var(--ion-color-primary)",
                    "--border-width": "2px",
                    "--border-style": "dashed"
                  }}
                />
              ) : (
                <IonLabel>
                  <h2>Teléfono</h2>
                  <IonText>{userData.phone}</IonText>
                </IonLabel>
              )}
            </IonItem>

            <IonItem>
              {isEditing ? (
                <IonInput
                  label="Dirección"
                  labelPlacement="floating"
                  value={editedData.address}
                  onIonInput={e => setEditedData({...editedData, address: e.detail.value})}
                  style={{
                    "--background": "rgba(var(--ion-color-primary-rgb), 0.1)",
                    "--border-color": "var(--ion-color-primary)",
                    "--border-width": "2px",
                    "--border-style": "dashed"
                  }}
                />
              ) : (
                <IonLabel>
                  <h2>Dirección</h2>
                  <IonText>{userData.address}</IonText>
                </IonLabel>
              )}
            </IonItem>

            <IonItem>
              <IonLabel>
                <h2>Rol</h2>
                <IonText>{userData.role === 'admin' ? 'Establecimiento' : 'Usuario'}</IonText>
              </IonLabel>
            </IonItem>
          </IonList>
        )}

        <div className="ion-padding">
          <IonButton expand="block" color="danger" onClick={handleLogout}>
            <IonIcon icon={logOut} slot="start" />
            Cerrar Sesión
          </IonButton>
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="bottom"
        />
      </IonContent>
    </IonPage>
  );
};

export default Profile;
