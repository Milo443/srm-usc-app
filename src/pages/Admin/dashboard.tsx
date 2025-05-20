import React, { useEffect, useState } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonToast,
  IonModal,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import { trash, create, person, logOut } from 'ionicons/icons';
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface User {
  uid: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  address: string;
  createdAt: any;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchText, setSearchText] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);

  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({
        ...doc.data(),
        uid: doc.id
      })) as User[];
      setUsers(usersList);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      setToastMessage('Error al cargar los usuarios');
      setShowToast(true);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    try {
      await deleteDoc(doc(db, 'users', uid));
      setToastMessage('Usuario eliminado exitosamente');
      setShowToast(true);
      fetchUsers();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setToastMessage('Error al eliminar el usuario');
      setShowToast(true);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.name?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
    (user.role?.toLowerCase() || '').includes(searchText.toLowerCase())
  );

  const handleLogout = () => {
    auth.signOut().then(() => {
        sessionStorage.removeItem('userData');
        localStorage.removeItem('userData');
        sessionStorage.removeItem('token');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }).catch((error) => {
        console.error('Error al cerrar sesión:', error);
        setToastMessage('Error al cerrar sesión');
        setShowToast(true);
      });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Panel Administrativo</IonTitle>

          <IonButtons slot="end">
                <IonButton onClick={handleLogout}>
              <IonIcon slot="icon-only" icon={logOut} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonSearchbar
          value={searchText}
          onIonChange={e => setSearchText(e.detail.value!)}
          placeholder="Buscar usuarios..."
        />

        <IonGrid>
          <IonRow>
            <IonCol>
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Estadísticas</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p>Total de usuarios: {users.length}</p>
                  <p>Usuarios normales: {users.filter(u => u.role === 'usuario').length}</p>
                  <p>Establecimientos: {users.filter(u => u.role === 'establecimiento').length}</p>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonList>
          {filteredUsers.map(user => (
            <IonItem key={user.uid}>
              <IonIcon icon={person} slot="start" />
              <IonLabel>
                <h2>{user.name}</h2>
                <p>{user.email}</p>
                <p>Rol: {user.role}</p>
              </IonLabel>
              <IonButton
                fill="clear"
                color="primary"
                onClick={() => {
                  setSelectedUser(user);
                  setShowModal(true);
                }}
              >
                <IonIcon icon={create} />
              </IonButton>
              <IonButton
                fill="clear"
                color="danger"
                onClick={() => handleDeleteUser(user.uid)}
              >
                <IonIcon icon={trash} />
              </IonButton>
            </IonItem>
          ))}
        </IonList>

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Detalles del Usuario</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {selectedUser && (
              <IonList>
                <IonItem>
                  <IonLabel>
                    <h2>Nombre</h2>
                    <p>{selectedUser.name}</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h2>Email</h2>
                    <p>{selectedUser.email}</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h2>Rol</h2>
                    <p>{selectedUser.role}</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h2>Teléfono</h2>
                    <p>{selectedUser.phone}</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h2>Dirección</h2>
                    <p>{selectedUser.address}</p>
                  </IonLabel>
                </IonItem>
              </IonList>
            )}
          </IonContent>
        </IonModal>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
        />
      </IonContent>
    </IonPage>
  );
};

export default AdminDashboard;
