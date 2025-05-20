import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonImg, IonButton, IonIcon, IonText, IonChip, IonBackButton, 
  IonButtons, IonSpinner, IonFab, IonFabButton, IonBadge, IonModal, IonFooter, IonToast } from '@ionic/react';
import { star, call, location, cartOutline } from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { Establishment } from '../types/establishment';
import { MenuCategory } from '../types/menu';
import { Order, OrderStatus } from '../types/order';
import MenuComponent, { MenuItem } from '../components/MenuComponent';
import CartComponent, { CartItem } from '../components/CartComponent';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const EstablishmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener datos del establecimiento
        const establishmentDoc = await getDoc(doc(db, 'establishments', id));
        if (establishmentDoc.exists()) {
          setEstablishment(establishmentDoc.data() as Establishment);
        }

        // Obtener categorías del menú
        const menuQuery = query(
          collection(db, 'menu_categories'),
          where('establishmentId', '==', id)
        );
        const menuSnapshot = await getDocs(menuQuery);
        const categories: MenuCategory[] = [];
        
        menuSnapshot.forEach((doc) => {
          categories.push({ id: doc.id, ...doc.data() } as MenuCategory);
        });

        setMenuCategories(categories);
      } catch (error) {
        console.error('Error al cargar los datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, db]);

  const handleAddToCart = (item: MenuItem) => {
    setCartItems(prevItems => {
      // Verificar si el ítem ya está en el carrito
      const existingItemIndex = prevItems.findIndex(cartItem => cartItem.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Incrementar la cantidad si ya existe
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        return updatedItems;
      } else {
        // Agregar como nuevo ítem si no existe
        return [...prevItems, {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1
        }];
      }
    });
    
    setToastMessage(`${item.name} agregado al carrito`);
    setShowToast(true);
  };

  const handleIncreaseQuantity = (itemId: string) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecreaseQuantity = (itemId: string) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId && item.quantity > 1 
          ? { ...item, quantity: item.quantity - 1 } 
          : item
      ).filter(item => item.quantity > 0)
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleStartOrder = async (paymentMethod: string) => {
    if (!auth.currentUser) {
      history.push('/login?redirect=/establishment/' + id);
      return;
    }

    if (!establishment) return;

    try {
      const newOrder: Omit<Order, 'id'> = {
        userId: auth.currentUser.uid,
        establishmentId: id,
        establishmentName: establishment.name,
        items: cartItems,
        status: OrderStatus.PENDING,
        totalAmount: calculateTotal(),
        createdAt: new Date(),
        paymentMethod: paymentMethod
      };

      const orderRef = await addDoc(collection(db, 'orders'), newOrder);
      
      // Redireccionar a la página de confirmación de la orden
      history.push(`/app/`);
      
      // Limpiar el carrito
      setCartItems([]);
      setShowCartModal(false);
    } catch (error) {
      console.error('Error al crear la orden:', error);
      setToastMessage('Error al crear la orden. Inténtalo de nuevo.');
      setShowToast(true);
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <IonSpinner />
          <p>Cargando información...</p>
        </IonContent>
      </IonPage>
    );
  }

  if (!establishment) {
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <p>Establecimiento no encontrado</p>
        </IonContent>
      </IonPage>
    );
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/home" />
          </IonButtons>
          <IonTitle>{establishment.name}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowCartModal(true)}>
              <IonIcon icon={cartOutline} />
              {totalItems > 0 && (
                <IonBadge color="danger" style={{ position: 'absolute', top: '0', right: '0' }}>
                  {totalItems}
                </IonBadge>
              )}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonImg src={establishment.image} alt={establishment.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
        
        <div className="ion-padding">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>{establishment.name}</IonCardTitle>
              <IonChip color="primary">
                <IonIcon icon={star} />
                <IonText>{establishment.rating}</IonText>
              </IonChip>
              <IonChip>{establishment.category}</IonChip>
            </IonCardHeader>
            
            <IonCardContent>
              <p>{establishment.description}</p>
              
              <IonButton fill="clear" href={`tel:${establishment.phone}`}>
                <IonIcon slot="start" icon={call} />
                {establishment.phone}
              </IonButton>
              
              <IonButton fill="clear">
                <IonIcon slot="start" icon={location} />
                {establishment.address}
              </IonButton>
            </IonCardContent>
          </IonCard>

          {menuCategories.length > 0 ? (
            <MenuComponent 
              categories={menuCategories} 
              onAddToCart={handleAddToCart}
            />
          ) : (
            <IonCard>
              <IonCardContent className="ion-text-center">
                <p>Este establecimiento aún no tiene menú disponible</p>
              </IonCardContent>
            </IonCard>
          )}
        </div>

        {/* Botón flotante del carrito para pantallas móviles */}
        {totalItems > 0 && !showCartModal && (
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton onClick={() => setShowCartModal(true)}>
              <IonIcon icon={cartOutline} />
              <IonBadge color="danger">{totalItems}</IonBadge>
            </IonFabButton>
          </IonFab>
        )}

        {/* Modal del carrito */}
        <IonModal isOpen={showCartModal} onDidDismiss={() => setShowCartModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Tu pedido</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowCartModal(false)}>Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <CartComponent 
              items={cartItems}
              establishmentId={id}
              establishmentName={establishment.name}
              onIncreaseQuantity={handleIncreaseQuantity}
              onDecreaseQuantity={handleDecreaseQuantity}
              onRemoveItem={handleRemoveItem}
              onStartOrder={handleStartOrder}
            />
          </IonContent>
        </IonModal>

        {/* Toast de notificación */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="bottom"
        />
      </IonContent>
      
      {/* Footer con resumen del carrito para tamaño desktop */}
      {totalItems > 0 && (
        <IonFooter className="ion-hide-md-down">
          <div className="ion-padding" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{totalItems} productos</strong> - Total: ${calculateTotal().toFixed(2)}
            </div>
            <IonButton onClick={() => setShowCartModal(true)}>
              Ver carrito
            </IonButton>
          </div>
        </IonFooter>
      )}
    </IonPage>
  );
};

export default EstablishmentDetail; 