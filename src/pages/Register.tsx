import React, {useState} from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonToast, IonInputPasswordToggle, IonSelect, IonSelectOption, IonRow, IonCol, IonImg, IonIcon } from '@ionic/react';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useHistory, Link} from 'react-router-dom';
import { camera } from 'ionicons/icons';



const Register: React.FC = () => {

  const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY

  //usuario
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  //establecimiento
  const [establishmentName, setEstablishmentName] = useState('');
  const [establishmentAddress, setEstablishmentAddress] = useState('');
  const [establishmentPhone, setEstablishmentPhone] = useState('');
  const [establishmentCategory, setEstablishmentCategory] = useState('');
  const [establishmentDescription, setEstablishmentDescription] = useState('');
  const [establishmentImage, setEstablishmentImage] = useState('');

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const history = useHistory();
  const auth = getAuth();
  const db = getFirestore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
      
      // Luego crear el documento en Firestore en db users
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
        console.log('Documento user creado en Firestore');

        if(role === 'establecimiento'){
          console.log('Iniciando proceso de registro de establecimiento...');
          const imageUrl = await uploadImageToImgBB();
          console.log('URL de imagen obtenida:', imageUrl);

          const establishmentDocRef = doc(db, 'establishments', userCredential.user.uid);
          const establishmentData = {
            name: establishmentName.trim(),
            address: establishmentAddress.trim(),
            phone: establishmentPhone.trim(),
            category: establishmentCategory.trim(),
            description: establishmentDescription.trim(),
            image: imageUrl,
            createdAt: new Date(),
            uid: userCredential.user.uid
          };

          console.log('Datos del establecimiento a guardar:', establishmentData);
          await setDoc(establishmentDocRef, establishmentData);
          console.log('Documento establishment creado en Firestore con imagen:', imageUrl);
        }

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setEstablishmentImage(URL.createObjectURL(file));
    }
  };

  const uploadImageToImgBB = async (): Promise<string> => {
    if (!selectedFile) return '';
    
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      console.log('Iniciando subida de imagen a ImgBB...');
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      console.log('Respuesta de ImgBB:', data);
      
      if (data.success) {
        console.log('Imagen subida exitosamente:', data.data.url);
        return data.data.url;
      }
      throw new Error('Error al subir la imagen');
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      throw error;
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
              <IonSelectOption value="establecimiento">Establecimiento</IonSelectOption>
              <IonSelectOption value="usuario">Usuario</IonSelectOption>
            </IonSelect>
          </IonItem>
         

         {/* establecimiento */}
         {role === 'establecimiento' && (
            <div style={{backgroundColor: 'red', padding: '10px'}}>
              <IonItem>
                <IonInput
                  label='Nombre del establecimiento'
                  labelPlacement='floating'
                  type="text"
                  value={establishmentName}
                  onIonChange={e => setEstablishmentName(e.detail.value!)}
                />
              </IonItem>

              <IonItem>
                <IonInput
                  label='Direccion del establecimiento'
                  labelPlacement='floating'
                  type="text"
                  value={establishmentAddress}
                  onIonChange={e => setEstablishmentAddress(e.detail.value!)}
                />
              </IonItem>

              <IonItem>
                <IonInput
                  label='Telefono del establecimiento'
                  labelPlacement='floating'
                  type="text"
                  value={establishmentPhone}
                  onIonChange={e => setEstablishmentPhone(e.detail.value!)}
                />
              </IonItem>

              <IonItem>
                <IonSelect
                  label='Categoria'
                  labelPlacement='floating'
                  value={establishmentCategory}
                  onIonChange={e => setEstablishmentCategory(e.detail.value!)}
                >
                  <IonSelectOption value="restaurante">Restaurante</IonSelectOption>
                  <IonSelectOption value="papeleria">Papeleria</IonSelectOption>
                  <IonSelectOption value="cafeteria">Cafeteria</IonSelectOption>
                  <IonSelectOption value="miscelanea">Miscelanea</IonSelectOption>
                  <IonSelectOption value="otro">Otro</IonSelectOption>
                </IonSelect>

              </IonItem>

              <IonItem>
                <IonInput
                  label='Descripcion del establecimiento'
                  labelPlacement='floating'
                  type="text"
                  value={establishmentDescription}
                  onIonChange={e => setEstablishmentDescription(e.detail.value!)}
                />
              </IonItem>

              <IonItem>
                <IonButton fill="clear" className="ion-margin-top" onClick={() => {
                  document.getElementById('imageInput')?.click();
                }}>
                  <IonIcon slot="start" icon={camera}></IonIcon>
                  Subir imagen                  
                </IonButton>

                <input
                  type="file"
                  accept="image/*"
                  id="imageInput"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />

                {establishmentImage && (
                  <IonImg src={establishmentImage} alt="Imagen del establecimiento" style={{width: '100px', height: '100px'}} />
                )}

              </IonItem>
            </div>
          )}





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
