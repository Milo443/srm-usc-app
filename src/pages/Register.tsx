import React, {useState} from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonToast, IonInputPasswordToggle, IonSelect, IonSelectOption, IonRow, IonCol, IonImg } from '@ionic/react';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useHistory, Link} from 'react-router-dom';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const history = useHistory();
  const auth = getAuth();
  const db = getFirestore();

  const register = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!name.trim()) {
      setToastMessage('El nombre es requerido');
      setShowToast(true);
      return;
    }

    if (!role) {
      setToastMessage('Debe seleccionar un rol');
      setShowToast(true);
      return;
    }

    if (!phone.trim()) {
      setToastMessage('El teléfono es requerido');
      setShowToast(true);
      return;
    }

    try {
      // Primero crear el usuario en Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Usuario creado en Auth:', userCredential.user.uid);
      
      // Luego crear el documento en Firestore
      try {
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        const userData = {
          name: name.trim(),
          address: address.trim(),
          phone: phone.trim(),
          role,
          email: email.toLowerCase(),
          createdAt: new Date(),
          uid: userCredential.user.uid
        };
        
        await setDoc(userDocRef, userData);
        console.log('Documento creado en Firestore');

        setToastMessage('Registro exitoso');
        setShowToast(true);
        history.push('/login');
      }catch (firestoreError: any) {
        console.error('Error al crear documento en Firestore:', firestoreError);
        setToastMessage('Error al guardar los datos del usuario');
        setShowToast(true);
      }
    } catch (error: any) {
      let errorMessage = 'Error en el registro';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este correo ya está registrado';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Correo electrónico inválido';
      }
      
      console.error('Error en el registro:', error);
      setToastMessage(errorMessage);
      setShowToast(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Registrarse</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">

        <IonRow class="ion-justify-content-center ion-align-items-center">
            <IonCol size="auto">
                <IonImg src="/assets/images/logo.png" alt="Logo" style={{width: '200px', height: '200px'}} />
            </IonCol>
        </IonRow>


        <form onSubmit={register}>
          <IonItem>
            <IonInput
              label='Nombre'
              labelPlacement='floating'
              type="text"
              value={name}
              onIonChange={e => setName(e.detail.value!)}
            />
          </IonItem>

          <IonItem>
            <IonInput
              label='Telefono'
              labelPlacement='floating'
              type="number"
              value={phone}
              onIonChange={e => setPhone(e.detail.value!)}
            />
          </IonItem>

          <IonItem>
            <IonInput
              label='Direccion'
              labelPlacement='floating'
              type="text"
              value={address}
              onIonChange={e => setAddress(e.detail.value!)}
            />
          </IonItem>


          <IonItem>
            <IonInput
              label='Correo electronico'
              labelPlacement='floating'
              type="email"
              value={email}
              onIonChange={e => setEmail(e.detail.value!)}
              required
            />
          </IonItem>

          <IonItem>
            <IonInput
              label='Contraseña'
              labelPlacement='floating'
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
            <IonSelect
              label='Rol'
              labelPlacement='floating'
              value={role}
              onIonChange={e => setRole(e.detail.value!)}
            >
              <IonSelectOption value="admin">Establecimiento</IonSelectOption>
              <IonSelectOption value="user">Usuario</IonSelectOption>
            </IonSelect>
          </IonItem>

          <IonButton className="ion-margin-top" type="submit" expand="block">
            Registrarse
          </IonButton>
        </form>
          <IonButton className="ion-margin-top" fill='outline' expand="block">
            <Link to="/login" style={{textDecoration: 'none', color:'inherit'}} >Iniciar sesion</Link>
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

export default Register;
