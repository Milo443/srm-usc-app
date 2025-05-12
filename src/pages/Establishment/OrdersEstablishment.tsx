import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSpinner,
  IonIcon,
  IonButton,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonModal,
  IonButtons,
  IonAlert,
  IonToast,
} from '@ionic/react';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  updateDoc,
  Timestamp,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Order, OrderStatus } from '../../types/order';
import { restaurant, add } from 'ionicons/icons';
import OrdersListEstablishment from '../../components/establishmnetComponent/OrdersListEstablishment';
import OrderDetailEstablishment from '../../components/establishmnetComponent/OrderDetailEstablishment';
import { getStatusText } from '../../components/establishmnetComponent/OrderUtils';
import { seedDataForCurrentUser } from '../../config/seedData';

type OrderFilter = 'all' | 'pending' | 'in_process' | 'ready' | 'completed';

const OrdersEstablishment: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState<OrderFilter>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [showUpdateAlert, setShowUpdateAlert] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<OrderStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, searchText, filter]);

  const checkUserIsEstablishment = async (): Promise<string | null> => {
    if (!auth.currentUser) {
      console.log("No hay usuario autenticado");
      return null;
    }

    const userId = auth.currentUser.uid;
    console.log("ID de usuario autenticado:", userId);

    try {
      // Verificar si el usuario es un establecimiento
      const userDoc = await getDoc(doc(db, 'establishments', userId));
      
      if (userDoc.exists()) {
        console.log("Usuario verificado como establecimiento:", userDoc.data());
        return userId;
      } else {
        console.log("El usuario no es un establecimiento válido");
        // Vamos a crear el establecimiento automáticamente para facilitar las pruebas
        await setDoc(doc(db, 'establishments', userId), {
          name: 'Mi Establecimiento',
          address: 'Mi Dirección',
          phone: '123-456-7890',
          category: 'Restaurante',
          description: 'Mi establecimiento de prueba',
          rating: 4.5,
          image: 'https://firebasestorage.googleapis.com/v0/b/example/restaurant.jpg',
          createdAt: new Date(),
        });
        console.log("Establecimiento creado automáticamente para el usuario:", userId);
        return userId;
      }
    } catch (error) {
      console.error("Error al verificar el tipo de usuario:", error);
      return null;
    }
  };

  const loadOrders = async () => {
    if (!auth.currentUser) {
      setLoading(false);
      setToastMessage('Debes iniciar sesión para ver tus órdenes');
      setShowToast(true);
      return;
    }

    try {
      setLoading(true);
      const establishmentId = auth.currentUser.uid;
      console.log("Cargando órdenes para establecimiento:", establishmentId);

      // Verificar y crear establecimiento si es necesario
      await checkUserIsEstablishment();

      // 1. Modificar la consulta para manejar posibles problemas
      const ordersCollection = collection(db, 'orders');
      let ordersQuery;
      
      try {
        ordersQuery = query(
          ordersCollection,
          where('establishmentId', '==', establishmentId)
          // Omitimos el orderBy temporalmente para descartar problemas de índices
          // orderBy('createdAt', 'desc')
        );
      } catch (error) {
        console.error("Error al crear la consulta:", error);
        ordersQuery = query(ordersCollection);
      }

      console.log("Ejecutando consulta para establecimiento:", establishmentId);

      // 2. Ejecutar la consulta con manejo de errores específico
      let querySnapshot;
      try {
        querySnapshot = await getDocs(ordersQuery);
        console.log("Órdenes encontradas:", querySnapshot.size);
      } catch (error) {
        console.error("Error al ejecutar la consulta:", error);
        setErrorMessage(`Error al ejecutar la consulta: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        setShowError(true);
        setLoading(false);
        return;
      }
      
      const ordersData: Order[] = [];

      // 3. Procesar documentos con verificaciones adicionales
      querySnapshot.forEach((doc) => {
        try {
          const data = doc.data();
          
          // Verificar si el documento pertenece a este establecimiento
          if (data.establishmentId !== establishmentId) {
            console.log("Documento ignorado porque no pertenece a este establecimiento:", doc.id);
            return;
          }
          
          console.log("Procesando orden:", doc.id);
          
          // Verificar formato de createdAt con mayor protección
          let createdAt;
          try {
            if (data.createdAt instanceof Timestamp) {
              createdAt = data.createdAt.toDate();
            } else if (data.createdAt instanceof Date) {
              createdAt = data.createdAt;
            } else if (data.createdAt) {
              createdAt = new Date(data.createdAt);
            } else {
              createdAt = new Date();
            }
          } catch (dateError) {
            console.error("Error al procesar fecha de creación:", dateError);
            createdAt = new Date();
          }

          // Validar array de items
          let items = [];
          try {
            items = Array.isArray(data.items) ? data.items : [];
          } catch (itemsError) {
            console.error("Error al procesar items:", itemsError);
          }

          // Crear objeto de orden con verificaciones
          const orderData: Order = {
            id: doc.id,
            userId: data.userId || "unknown",
            establishmentId: data.establishmentId,
            establishmentName: data.establishmentName || "Mi Establecimiento",
            items: items,
            status: data.status || OrderStatus.PENDING,
            totalAmount: typeof data.totalAmount === 'number' ? data.totalAmount : 0,
            createdAt: createdAt,
            notes: data.notes || "",
          };

          // Añadir updatedAt solo si existe
          if (data.updatedAt) {
            try {
              orderData.updatedAt = data.updatedAt instanceof Timestamp 
                ? data.updatedAt.toDate() 
                : new Date(data.updatedAt);
            } catch (updateError) {
              console.error("Error al procesar fecha de actualización:", updateError);
            }
          }

          ordersData.push(orderData);
          console.log("Orden procesada correctamente:", doc.id);
        } catch (err) {
          console.error("Error al procesar la orden:", doc.id, err);
        }
      });

      console.log("Total órdenes procesadas:", ordersData.length);
      
      // Ordenar manualmente por fecha de creación (más reciente primero)
      ordersData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setOrders(ordersData);
      
      if (ordersData.length === 0) {
        console.log("No se encontraron órdenes, mostrando datos de ejemplo en memoria");
        // Si no hay órdenes, agregar datos de ejemplo para demostración
        addDemoOrders(establishmentId);
      }
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
      setErrorMessage(`Error al cargar órdenes: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const addTestData = async () => {
    if (!auth.currentUser) {
      setToastMessage('Debes iniciar sesión para agregar datos de prueba');
      setShowToast(true);
      return;
    }

    try {
      setLoading(true);
      const userId = auth.currentUser.uid;
      
      // Cargar datos de prueba para el usuario actual
      await seedDataForCurrentUser(userId);
      
      // Mostrar mensaje de éxito
      setToastMessage('Datos de prueba agregados correctamente. Recargando...');
      setShowToast(true);
      
      // Esperar un momento antes de recargar
      setTimeout(async () => {
        await loadOrders();
      }, 1500);
    } catch (error) {
      console.error('Error al agregar datos de prueba:', error);
      setErrorMessage(`Error al agregar datos de prueba: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const addDemoOrders = (establishmentId: string) => {
    const demoOrders: Order[] = [
      {
        id: 'demo1',
        userId: 'user1',
        establishmentId: establishmentId,
        establishmentName: "Mi Establecimiento",
        items: [
          { id: 'item1', name: 'Hamburguesa Especial', price: 12.99, quantity: 2 },
          { id: 'item2', name: 'Papas Fritas', price: 4.50, quantity: 1 },
          { id: 'item3', name: 'Refresco Grande', price: 2.99, quantity: 2 }
        ],
        status: OrderStatus.PENDING,
        totalAmount: 36.46,
        createdAt: new Date(),
        notes: "Sin cebolla en las hamburguesas, por favor."
      },
      {
        id: 'demo2',
        userId: 'user2',
        establishmentId: establishmentId,
        establishmentName: "Mi Establecimiento",
        items: [
          { id: 'item4', name: 'Pizza Familiar', price: 18.99, quantity: 1 },
          { id: 'item5', name: 'Alitas de Pollo', price: 9.99, quantity: 1 }
        ],
        status: OrderStatus.CONFIRMED,
        totalAmount: 28.98,
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
      },
      {
        id: 'demo3',
        userId: 'user3',
        establishmentId: establishmentId,
        establishmentName: "Mi Establecimiento",
        items: [
          { id: 'item6', name: 'Ensalada César', price: 8.50, quantity: 1 },
          { id: 'item7', name: 'Agua Mineral', price: 1.50, quantity: 1 }
        ],
        status: OrderStatus.READY,
        totalAmount: 10.00,
        createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hora atrás
      }
    ];

    setOrders(demoOrders);
  };

  const applyFilters = () => {
    let result = [...orders];

    // Aplicar filtro de estado
    if (filter === 'pending') {
      result = result.filter(order => order.status === OrderStatus.PENDING);
    } else if (filter === 'in_process') {
      result = result.filter(order => 
        order.status === OrderStatus.CONFIRMED || 
        order.status === OrderStatus.IN_PREPARATION
      );
    } else if (filter === 'ready') {
      result = result.filter(order => order.status === OrderStatus.READY);
    } else if (filter === 'completed') {
      result = result.filter(order => 
        order.status === OrderStatus.DELIVERED || 
        order.status === OrderStatus.CANCELLED
      );
    }

    // Aplicar búsqueda
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(order => 
        order.id?.toLowerCase().includes(searchLower) ||
        (order.items.some(item => item.name.toLowerCase().includes(searchLower)))
      );
    }

    setFilteredOrders(result);
  };

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await loadOrders();
    event.detail.complete();
  };

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const confirmStatusUpdate = (order: Order, newStatus: OrderStatus) => {
    setSelectedOrder(order);
    setUpdateStatus(newStatus);
    setShowUpdateAlert(true);
  };

  const updateOrderStatus = async () => {
    if (!selectedOrder || !updateStatus) return;

    try {
      const orderRef = doc(db, 'orders', selectedOrder.id!);
      await updateDoc(orderRef, {
        status: updateStatus,
        updatedAt: new Date()
      });

      // Actualizar la orden en el estado local
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === selectedOrder.id 
            ? {...order, status: updateStatus, updatedAt: new Date()} 
            : order
        )
      );

      setShowUpdateAlert(false);
      setSelectedOrder(null);
      setUpdateStatus(null);
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      setErrorMessage('Error al actualizar el estado de la orden');
      setShowError(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Pedidos</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={addTestData}>
              <IonIcon slot="icon-only" icon={add} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <div className="ion-padding">
          {/* Buscador */}
          <IonSearchbar
            value={searchText}
            onIonChange={e => setSearchText(e.detail.value!)}
            placeholder="Buscar pedidos"
            animated
            showCancelButton="focus"
          />

          {/* Filtro por estado */}
          <IonSegment value={filter} onIonChange={e => setFilter(e.detail.value as OrderFilter)}>
            <IonSegmentButton value="all">
              <IonLabel>Todos</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="pending">
              <IonLabel>Pendientes</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="in_process">
              <IonLabel>En proceso</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="ready">
              <IonLabel>Listos</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="completed">
              <IonLabel>Completados</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>

        {loading && (
          <div className="ion-padding ion-text-center">
            <IonSpinner />
            <p>Cargando pedidos...</p>
          </div>
        )}

        {!loading && filteredOrders.length === 0 && (
          <div className="ion-padding ion-text-center">
            <IonIcon icon={restaurant} style={{ fontSize: '48px', color: '#ccc' }} />
            <p>
              {searchText.trim() || filter !== 'all'
                ? 'No se encontraron pedidos con los filtros seleccionados'
                : 'No hay pedidos disponibles'}
            </p>
            {(searchText.trim() || filter !== 'all') && (
              <IonButton onClick={() => { setSearchText(''); setFilter('all'); }}>
                Limpiar filtros
              </IonButton>
            )}
            <IonButton onClick={loadOrders} expand="block" className="ion-margin-top">
              Recargar pedidos
            </IonButton>
            <IonButton onClick={addTestData} expand="block" color="secondary" className="ion-margin-top">
              Agregar datos de prueba
            </IonButton>
          </div>
        )}

        {!loading && filteredOrders.length > 0 && (
          <OrdersListEstablishment
            orders={filteredOrders}
            onOpenOrderDetail={openOrderDetail}
            onConfirmStatusUpdate={confirmStatusUpdate}
          />
        )}

        {/* Modal de detalles de la orden */}
        <IonModal isOpen={showOrderDetail} onDidDismiss={() => setShowOrderDetail(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Detalles del Pedido</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowOrderDetail(false)}>Cerrar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            {selectedOrder && (
              <OrderDetailEstablishment
                order={selectedOrder}
                onConfirmStatusUpdate={confirmStatusUpdate}
              />
            )}
          </IonContent>
        </IonModal>

        {/* Alerta de confirmación */}
        <IonAlert
          isOpen={showUpdateAlert}
          onDidDismiss={() => setShowUpdateAlert(false)}
          header="Confirmar cambio"
          message={`¿Estás seguro de que deseas cambiar el estado del pedido a "${updateStatus ? getStatusText(updateStatus) : ''}"?`}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
            },
            {
              text: 'Confirmar',
              handler: updateOrderStatus
            }
          ]}
        />

        {/* Alerta de error */}
        <IonAlert
          isOpen={showError}
          onDidDismiss={() => setShowError(false)}
          header="Error"
          message={errorMessage || 'Ha ocurrido un error inesperado'}
          buttons={['OK']}
        />

        {/* Toast de notificación */}
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

export default OrdersEstablishment;
