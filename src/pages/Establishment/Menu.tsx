import React, { useEffect, useState } from 'react';
import { 
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, 
  IonButton, IonIcon, IonCard, IonCardContent, IonCardHeader, 
  IonCardTitle, IonList, IonItem, IonLabel, IonFab, IonFabButton,
  IonModal, IonInput, IonTextarea, IonSelect, IonSelectOption,
  IonButtons, IonBackButton, IonToast, IonImg, IonGrid, IonRow, IonCol,
  IonText,
  IonChip
} from '@ionic/react';
import { add, create, trash, camera } from 'ionicons/icons';
import { getFirestore, collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  available?: boolean;
}

interface MenuCategory {
  id: string;
  name: string;
  establishmentId: string;
  items?: MenuItem[];
}

const Menu: React.FC = () => {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'category' | 'item'>('category');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemImage, setNewItemImage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      if (!auth.currentUser) return;

      const establishmentId = auth.currentUser.uid;
      
      // Obtener categorías
      const categoriesQuery = query(
        collection(db, 'menu_categories'),
        where('establishmentId', '==', establishmentId)
      );
      
      const categoriesSnapshot = await getDocs(categoriesQuery);
      const categoriesData: MenuCategory[] = [];
      
      for (const categoryDoc of categoriesSnapshot.docs) {
        const category = { 
          id: categoryDoc.id, 
          ...categoryDoc.data() 
        } as MenuCategory;
        
        // Obtener items de cada categoría
        const itemsQuery = query(
          collection(db, 'menu_items'),
          where('categoryId', '==', category.id)
        );
        
        const itemsSnapshot = await getDocs(itemsQuery);
        const items: MenuItem[] = [];
        
        itemsSnapshot.forEach(itemDoc => {
          items.push({ 
            id: itemDoc.id, 
            ...itemDoc.data() 
          } as MenuItem);
        });
        
        category.items = items;
        categoriesData.push(category);
      }
      
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error al cargar el menú:', error);
      setToastMessage('Error al cargar el menú');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const openAddCategoryModal = () => {
    setModalType('category');
    setNewCategoryName('');
    setShowModal(true);
  };

  const openAddItemModal = (categoryId: string) => {
    setModalType('item');
    setSelectedCategory(categoryId);
    setNewItemName('');
    setNewItemDescription('');
    setNewItemPrice('');
    setNewItemImage('');
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleAddCategory = async () => {
    try {
      if (!newCategoryName.trim()) {
        setToastMessage('El nombre de la categoría es requerido');
        setShowToast(true);
        return;
      }

      const establishmentId = auth.currentUser?.uid;
      
      if (!establishmentId) {
        setToastMessage('Error de autenticación');
        setShowToast(true);
        return;
      }

      await addDoc(collection(db, 'menu_categories'), {
        name: newCategoryName.trim(),
        establishmentId
      });

      setShowModal(false);
      setToastMessage('Categoría agregada con éxito');
      setShowToast(true);
      fetchMenuData();
    } catch (error) {
      console.error('Error al agregar categoría:', error);
      setToastMessage('Error al agregar categoría');
      setShowToast(true);
    }
  };

  const handleAddItem = async () => {
    try {
      if (!newItemName.trim() || !newItemPrice) {
        setToastMessage('El nombre y precio son requeridos');
        setShowToast(true);
        return;
      }

      if (!selectedCategory) {
        setToastMessage('Categoría no seleccionada');
        setShowToast(true);
        return;
      }

      const price = parseFloat(newItemPrice);
      
      if (isNaN(price) || price <= 0) {
        setToastMessage('El precio debe ser un número válido mayor a cero');
        setShowToast(true);
        return;
      }

      let imageUrl = 'https://via.placeholder.com/150?text=Sin+Imagen';
      
      if (selectedFile) {
        try {
          imageUrl = await uploadImageToImgBB();
        } catch (error) {
          console.error('Error al subir imagen:', error);
          setToastMessage('Error al subir la imagen, pero se guardará el producto');
          setShowToast(true);
        }
      }

      await addDoc(collection(db, 'menu_items'), {
        name: newItemName.trim(),
        description: newItemDescription.trim(),
        price,
        image: imageUrl,
        categoryId: selectedCategory,
        available: true
      });

      setShowModal(false);
      setToastMessage('Producto agregado con éxito');
      setShowToast(true);
      setSelectedFile(null);
      fetchMenuData();
    } catch (error) {
      console.error('Error al agregar producto:', error);
      setToastMessage('Error al agregar producto');
      setShowToast(true);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      // Primero eliminar todos los items de la categoría
      const itemsQuery = query(
        collection(db, 'menu_items'),
        where('categoryId', '==', categoryId)
      );
      
      const itemsSnapshot = await getDocs(itemsQuery);
      
      const deletePromises = itemsSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      await Promise.all(deletePromises);
      
      // Luego eliminar la categoría
      await deleteDoc(doc(db, 'menu_categories', categoryId));
      
      setToastMessage('Categoría eliminada con éxito');
      setShowToast(true);
      fetchMenuData();
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      setToastMessage('Error al eliminar categoría');
      setShowToast(true);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteDoc(doc(db, 'menu_items', itemId));
      setToastMessage('Producto eliminado con éxito');
      setShowToast(true);
      fetchMenuData();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      setToastMessage('Error al eliminar producto');
      setShowToast(true);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setNewItemImage(URL.createObjectURL(file));
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
          <IonTitle>Menú del Establecimiento</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Gestión del Menú</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>Aquí puedes administrar las categorías y productos de tu menú.</p>
            <IonButton expand="block" onClick={openAddCategoryModal}>
              <IonIcon icon={add} slot="start" />
              Agregar Categoría
            </IonButton>
          </IonCardContent>
        </IonCard>

        {categories.length === 0 && !loading ? (
          <IonCard>
            <IonCardContent className="ion-text-center">
              <p>No hay categorías en el menú. ¡Agrega una para comenzar!</p>
            </IonCardContent>
          </IonCard>
        ) : (
          categories.map(category => (
            <IonCard key={category.id} className="ion-margin-bottom">
              <IonCardHeader>
                <IonCardTitle>{category.name}</IonCardTitle>
                <IonButton fill="clear" color="danger" onClick={() => handleDeleteCategory(category.id)}>
                  <IonIcon icon={trash} />
                </IonButton>
              </IonCardHeader>
              <IonCardContent>
                <IonButton size="small" onClick={() => openAddItemModal(category.id)}>
                  <IonIcon icon={add} slot="start" />
                  Agregar Producto
                </IonButton>

                {category.items && category.items.length > 0 ? (
                  <IonGrid>
                    {category.items.map(item => (
                      <IonRow key={item.id} className="ion-align-items-center ion-margin-bottom">
                        <IonCol size="3" sizeSm="2">
                          <IonImg 
                            src={item.image} 
                            alt={item.name} 
                            style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px', paddingRight: '10px' }} 
                          />
                        </IonCol>
                        <IonCol size="6" sizeSm="8">
                          <h2 style={{ fontWeight: 'bold', marginBottom: '4px' }}>{item.name}</h2>
                          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '8px' }}>{item.description}</p>
                          <IonText color="primary" style={{ fontWeight: 'bold' }}>
                            ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                          </IonText>
                          {item.available === false && (
                            <IonChip color="danger" style={{ marginLeft: '8px' }}>
                              No disponible
                            </IonChip>
                          )}
                        </IonCol>
                        <IonCol size="3" sizeSm="2" className="ion-text-end">
                          <IonButton fill="clear" color="danger" onClick={() => handleDeleteItem(item.id)}>
                            <IonIcon icon={trash} />
                          </IonButton>
                        </IonCol>
                      </IonRow>
                    ))}
                  </IonGrid>
                ) : (
                  <p className="ion-text-center">No hay productos en esta categoría</p>
                )}
              </IonCardContent>
            </IonCard>
          ))
        )}

        {/* Modal para agregar categoría o producto */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonButton onClick={() => setShowModal(false)}>Cancelar</IonButton>
              </IonButtons>
              <IonTitle>
                {modalType === 'category' ? 'Nueva Categoría' : 'Nuevo Producto'}
              </IonTitle>
              <IonButtons slot="end">
                <IonButton strong onClick={modalType === 'category' ? handleAddCategory : handleAddItem}>
                  Guardar
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {modalType === 'category' ? (
              <IonItem>
                <IonInput
                  label="Nombre de la categoría"
                  labelPlacement="floating"
                  value={newCategoryName}
                  onIonChange={e => setNewCategoryName(e.detail.value!)}
                />
              </IonItem>
            ) : (
              <>
                <IonItem>
                  <IonInput
                    label="Nombre del producto"
                    labelPlacement="floating"
                    value={newItemName}
                    onIonChange={e => setNewItemName(e.detail.value!)}
                  />
                </IonItem>
                <IonItem>
                  <IonTextarea
                    label="Descripción"
                    labelPlacement="floating"
                    value={newItemDescription}
                    onIonChange={e => setNewItemDescription(e.detail.value!)}
                  />
                </IonItem>
                <IonItem>
                  <IonInput
                    label="Precio"
                    labelPlacement="floating"
                    type="number"
                    value={newItemPrice}
                    onIonChange={e => setNewItemPrice(e.detail.value!)}
                  />
                </IonItem>
                <IonItem>
                  <IonButton fill="clear" className="ion-margin-top" onClick={() => {
                    document.getElementById('productImageInput')?.click();
                  }}>
                    <IonIcon slot="start" icon={camera}></IonIcon>
                    Subir imagen del producto                  
                  </IonButton>

                  <input
                    type="file"
                    accept="image/*"
                    id="productImageInput"
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />

                  {newItemImage && (
                    <IonImg src={newItemImage} alt="Imagen del producto" style={{width: '100px', height: '100px', objectFit: 'cover', marginLeft: '10px'}} />
                  )}
                </IonItem>
              </>
            )}
          </IonContent>
        </IonModal>

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

export default Menu;
