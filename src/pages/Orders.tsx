import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem, 
  IonLabel, IonText, IonBadge, IonSpinner, IonIcon, IonButton, IonItemSliding, 
  IonItemOption, IonItemOptions, IonRefresher, IonRefresherContent, RefresherEventDetail, 
  IonSearchbar, IonSegment, IonSegmentButton, IonCard, IonCardContent, IonAlert } from '@ionic/react';
import { getFirestore, collection, query, where, getDocs, orderBy, Timestamp, DocumentData } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Order, OrderStatus } from '../types/order';
import { timeOutline, restaurant, search, filterOutline } from 'ionicons/icons';
import { useHistory } from 'react-router';

type OrderFilter = 'all' | 'active' | 'completed';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState<OrderFilter>('all');
  const [showAlert, setShowAlert] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const history = useHistory();
  const auth = getAuth();
  const db = getFirestore();

  // Verificar estado de autenticación primero
  useEffect(() => {
    console.log("Verificando autenticación...");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (user) {
        console.log("Usuario autenticado:", user.uid);
      } else {
        console.log("No hay usuario autenticado");
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // Cargar órdenes cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      console.log("Usuario autenticado, cargando órdenes...");
      loadOrders();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Aplicar filtros cuando cambien los orders, el texto de búsqueda o el filtro
    applyFilters();
    // Registrar cantidad de órdenes en el estado
    console.log("Total de órdenes en estado:", orders.length);
  }, [orders, searchText, filter]);

  const loadOrders = async () => {
    if (!auth.currentUser) {
      console.log("No hay usuario autenticado al cargar órdenes");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userId = auth.currentUser.uid;
      console.log("Consultando órdenes para el usuario:", userId);
      
      // Primero verificamos si la colección existe
      console.log("Obteniendo colecciones disponibles...");
      
      const ordersCollection = collection(db, 'orders');
      console.log("Referencia a colección creada:", ordersCollection.path);
      
      // Intentemos primero una consulta más simple para verificar
      console.log("Ejecutando consulta simple sin índice...");
      try {
        const simpleQuery = query(ordersCollection);
        const simpleSnapshot = await getDocs(simpleQuery);
        console.log("Documentos totales en la colección:", simpleSnapshot.size);
        
        // Mostrar los primeros 5 documentos para depurar
        let docsCounter = 0;
        simpleSnapshot.forEach(doc => {
          if (docsCounter < 5) {
            console.log(`Documento #${docsCounter}:`, doc.id, doc.data());
            docsCounter++;
          }
        });
      } catch (simpleError) {
        console.error("Error en consulta simple:", simpleError);
      }
      
      // Ahora intentamos la consulta original
      console.log("Ejecutando consulta completa con índice...");
      const ordersQuery = query(
        ordersCollection,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      console.log("Query configurado, ejecutando...");
      const querySnapshot = await getDocs(ordersQuery);
      console.log("Resultado de la consulta:", querySnapshot.size, "documentos");
      
      const ordersData: Order[] = [];
      
      querySnapshot.forEach((doc) => {
        console.log("Documento encontrado:", doc.id);
        const data = doc.data();
        console.log("Datos del documento:", JSON.stringify(data));
        
        try {
          // Verificar formato de createdAt
          let createdAt;
          if (data.createdAt instanceof Timestamp) {
            console.log("createdAt es un Timestamp");
            createdAt = data.createdAt.toDate();
          } else if (data.createdAt instanceof Date) {
            console.log("createdAt es un Date");
            createdAt = data.createdAt;
          } else if (data.createdAt) {
            console.log("createdAt es otro formato:", typeof data.createdAt, data.createdAt);
            createdAt = new Date(data.createdAt);
          } else {
            console.log("createdAt no está definido, usando fecha actual");
            createdAt = new Date();
          }
          
          const orderData: Order = {
            id: doc.id,
            userId: data.userId || userId,
            establishmentId: data.establishmentId || "",
            establishmentName: data.establishmentName || "Establecimiento",
            items: data.items || [],
            status: data.status || OrderStatus.PENDING,
            totalAmount: data.totalAmount || 0,
            paymentMethod: data.paymentMethod || "Efectivo",
            createdAt: createdAt,
            ...(data.updatedAt && { updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt) })
          };
          
          console.log("Orden procesada:", orderData);
          ordersData.push(orderData);
        } catch (err) {
          console.error("Error al procesar la orden:", doc.id, err);
        }
      });
      
      console.log("Total de órdenes cargadas:", ordersData.length);
      if (ordersData.length === 0) {
        // Si no encontramos órdenes, añadimos datos de prueba temporales
        console.log("No se encontraron órdenes, añadiendo datos de prueba...");
        const testOrders = getTestOrders(userId);
        setOrders(testOrders);
        setFilteredOrders(testOrders);
      } else {
        setOrders(ordersData);
        setFilteredOrders(ordersData);
      }
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
      setError('Error al cargar tus pedidos. Por favor, intenta de nuevo. Error: ' + error);
      setShowAlert(true);
      
      // Si ocurre un error, también mostramos datos de prueba
      console.log("Error en la consulta, añadiendo datos de prueba...");
      const testOrders = getTestOrders(auth.currentUser.uid);
      setOrders(testOrders);
      setFilteredOrders(testOrders);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (orders.length === 0) {
      setFilteredOrders([]);
      return;
    }
    
    console.log("Aplicando filtros. Estado actual:", filter, "Texto:", searchText);
    let result = [...orders];
    
    // Aplicar filtro de estado
    if (filter === 'active') {
      result = result.filter(order => 
        order.status === OrderStatus.PENDING || 
        order.status === OrderStatus.CONFIRMED || 
        order.status === OrderStatus.IN_PREPARATION ||
        order.status === OrderStatus.READY
      );
    } else if (filter === 'completed') {
      result = result.filter(order => 
        order.status === OrderStatus.DELIVERED || 
        order.status === OrderStatus.CANCELLED
      );
    }
    
    // Aplicar búsqueda de texto
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(order => 
        order.establishmentName.toLowerCase().includes(searchLower) ||
        order.id?.toLowerCase().includes(searchLower) ||
        (order.items.some(item => item.name.toLowerCase().includes(searchLower)))
      );
    }
    
    console.log("Órdenes filtradas:", result.length);
    setFilteredOrders(result);
  };

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    console.log("Refrescando órdenes...");
    await loadOrders();
    event.detail.complete();
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'warning';
      case OrderStatus.CONFIRMED:
      case OrderStatus.IN_PREPARATION:
        return 'primary';
      case OrderStatus.READY:
        return 'success';
      case OrderStatus.DELIVERED:
        return 'success';
      case OrderStatus.CANCELLED:
        return 'danger';
      default:
        return 'medium';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Pendiente';
      case OrderStatus.CONFIRMED:
        return 'Confirmada';
      case OrderStatus.IN_PREPARATION:
        return 'En preparación';
      case OrderStatus.READY:
        return 'Lista para recoger';
      case OrderStatus.DELIVERED:
        return 'Entregada';
      case OrderStatus.CANCELLED:
        return 'Cancelada';
      default:
        return status;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const viewOrderDetail = (orderId: string) => {
    history.push(`/orders/${orderId}`);
  };

  // Función para obtener órdenes de prueba, refactorizado desde addTestOrders
  const getTestOrders = (userId: string): Order[] => {
    return [
      {
        id: 'test1',
        userId: userId,
        establishmentId: 'est1',
        establishmentName: 'Restaurante Prueba',
        items: [
          { id: 'item1', name: 'Hamburguesa', price: 10.99, quantity: 2 },
          { id: 'item2', name: 'Refresco', price: 1.99, quantity: 2 }
        ],
        status: OrderStatus.PENDING,
        totalAmount: 25.96,
        createdAt: new Date()
      },
      {
        id: 'test2',
        userId: userId,
        establishmentId: 'est2',
        establishmentName: 'Pizza Rápida',
        items: [
          { id: 'item3', name: 'Pizza Familiar', price: 18.99, quantity: 1 }
        ],
        status: OrderStatus.DELIVERED,
        totalAmount: 18.99,
        createdAt: new Date(Date.now() - 86400000) // Ayer
      }
    ];
  };

  // Modificar addTestOrders para utilizar getTestOrders
  const addTestOrders = () => {
    if (!auth.currentUser) return;
    
    const testOrders = getTestOrders(auth.currentUser.uid);
    setOrders(testOrders);
    setFilteredOrders(testOrders);
    console.log("Órdenes de prueba añadidas:", testOrders.length);
  };

  if (loading && orders.length === 0) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Mis pedidos</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding ion-text-center">
          <IonSpinner />
          <p>Cargando pedidos...</p>
        </IonContent>
      </IonPage>
    );
  }

  if (!auth.currentUser) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Mis pedidos</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding ion-text-center">
          <p>Debes iniciar sesión para ver tus pedidos</p>
          <IonButton routerLink="/login">Iniciar sesión</IonButton>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mis pedidos</IonTitle>
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
            placeholder="Buscar en mis pedidos"
            animated
            showCancelButton="focus"
          />

          {/* Filtro por estado */}
          <IonSegment value={filter} onIonChange={e => setFilter(e.detail.value as OrderFilter)}>
            <IonSegmentButton value="all">
              <IonLabel>Todos</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="active">
              <IonLabel>Activos</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="completed">
              <IonLabel>Completados</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>

        {/* Botón para añadir órdenes de prueba (solo en desarrollo) */}
        <div className="ion-padding ion-text-center">
          <IonButton onClick={addTestOrders} size="small" color="secondary">
            Añadir órdenes de prueba
          </IonButton>
          <IonButton onClick={loadOrders} size="small">
            Recargar
          </IonButton>
        </div>

        {loading && (
          <div className="ion-padding ion-text-center">
            <IonSpinner />
            <p>Actualizando...</p>
          </div>
        )}

        {!loading && filteredOrders.length === 0 && (
          <div className="ion-padding ion-text-center">
            <IonIcon icon={restaurant} style={{ fontSize: '48px', color: '#ccc' }} />
            <p>
              {searchText.trim() || filter !== 'all' 
                ? 'No se encontraron pedidos con los filtros seleccionados' 
                : 'No tienes pedidos todavía'}
            </p>
            {!searchText.trim() && filter === 'all' && (
              <IonButton routerLink="/app/home">Explorar establecimientos</IonButton>
            )}
            {(searchText.trim() || filter !== 'all') && (
              <IonButton onClick={() => {setSearchText(''); setFilter('all');}}>
                Limpiar filtros
              </IonButton>
            )}
          </div>
        )}

        {!loading && filteredOrders.length > 0 && (
          <IonList>
            {filteredOrders.map(order => (
              <IonItemSliding key={order.id}>
                {/*<IonItem button onClick={() => viewOrderDetail(order.id!)}>*/}
                <IonItem>
                  <IonLabel>
                    <h2>{order.establishmentName}</h2>
                    <p>
                      <IonIcon icon={timeOutline} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                      {formatDate(order.createdAt)}
                    </p>
                    <p>
                      <strong>Método de pago:</strong> {order.paymentMethod === 'efectivo' ? 'Efectivo' : 'Tarjeta'}
                    </p>
                    <p>
                      
                      <strong>Total:</strong> ${order.totalAmount.toFixed(2)} • 
                      <strong> Items:</strong> {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </p>
                    {order.items.length > 0 && (
                      <IonText color="medium" style={{ fontSize: '0.8em' }}>
                        {order.items.slice(0, 2).map(item => `${item.quantity}x ${item.name}`).join(', ')}
                        {order.items.length > 2 ? '...' : ''}
                      </IonText>
                    )}
                  </IonLabel>
                  <IonBadge color={getStatusColor(order.status)} slot="end">
                    {getStatusText(order.status)}
                  </IonBadge>
                </IonItem>
                
              </IonItemSliding>
            ))}
          </IonList>
        )}

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Error"
          message={error || 'Ocurrió un error inesperado'}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Orders;
