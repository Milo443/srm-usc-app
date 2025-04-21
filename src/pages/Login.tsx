import React, {useState, useEffect} from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonToast, IonRow, IonCol, IonImg, IonInputPasswordToggle, IonCheckbox } from '@ionic/react';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { useHistory, Link } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const history = useHistory();
  const auth = getAuth();

  // Verificar sesión al cargar el componente
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Verificar si hay datos guardados
        const savedUserData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
        if (savedUserData) {
          console.log('Sesión activa encontrada');
          history.push('/app');
        }
      }
    });

    return () => unsubscribe(); // Limpiar el listener
  }, [auth, history]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();

      // Guardar datos en el almacenamiento seleccionado
      const storage = rememberMe ? localStorage : sessionStorage;
      const userData = {
        email: user.email,
        uid: user.uid,
        token,
        rememberMe,
        lastLogin: new Date().toISOString()
      };

      storage.setItem('userData', JSON.stringify(userData));
      storage.setItem('token', token);

      console.log('Inicio de sesión exitoso');
      history.push('/app');
    } catch (error: any) {
      let errorMessage = 'Error en el inicio de sesión';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Contraseña incorrecta';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuario no encontrado';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Correo electrónico inválido';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos fallidos. Intente más tarde';
      }

      setToastMessage(errorMessage);
      setShowToast(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Iniciar sesión</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonRow class="ion-justify-content-center ion-align-items-center">
          <IonCol size="auto">
            <IonImg src="/assets/images/logo.png" alt="Logo" style={{width: '200px', height: '200px'}} />
          </IonCol>
        </IonRow>

        <form onSubmit={handleLogin}>
          <IonItem>
            <IonInput
              label="Correo electrónico"
              labelPlacement="floating"
              type="email"
              value={email}
              onIonChange={e => setEmail(e.detail.value!)}
              required
            />
          </IonItem>

          <IonItem>
            <IonInput
              label="Contraseña"
              labelPlacement="floating"
              type="password"
              value={password}
              onIonChange={e => setPassword(e.detail.value!)}
              required
            >
              <IonInputPasswordToggle
                slot="end"
                color="primary"
              />
            </IonInput>
          </IonItem>

          <IonItem>
            <IonCheckbox
              checked={rememberMe}
              onIonChange={e => setRememberMe(e.detail.checked)}
            >Mantener sesión iniciada</IonCheckbox>
          </IonItem>

          <IonButton className="ion-margin-top" type="submit" expand="block">
            Iniciar Sesión
          </IonButton>
        </form>

        <IonButton className="ion-margin-top" fill="outline" expand="block">
          <Link to="/register" style={{textDecoration: 'none', color:'inherit'}}>Crear cuenta</Link>
        </IonButton>

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

export default Login;
