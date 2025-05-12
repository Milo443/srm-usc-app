import { collection, doc, setDoc, getFirestore } from 'firebase/firestore';
import { OrderStatus } from '../types/order';

// Función para cargar datos de prueba en Firestore
export const seedTestData = async (): Promise<void> => {
  const db = getFirestore();

  try {
    console.log('Comenzando a insertar datos de prueba en Firestore');

    // ID del establecimiento de prueba (idealmente sería el mismo que el usuario actual)
    const testEstablishmentId = 'test-establishment-123';
    
    // Crear establecimiento de prueba
    await setDoc(doc(db, 'establishments', testEstablishmentId), {
      name: 'Restaurante de Prueba',
      address: 'Calle Principal 123',
      phone: '123-456-7890',
      category: 'Restaurante',
      description: 'Este es un establecimiento de prueba',
      rating: 4.5,
      image: 'https://firebasestorage.googleapis.com/v0/b/example/restaurant.jpg',
      createdAt: new Date(),
    });
    
    console.log('Establecimiento de prueba creado:', testEstablishmentId);

    // Crear órdenes de prueba
    const ordersCollection = collection(db, 'orders');
    
    const orderData = [
      {
        id: 'test-order-1',
        userId: 'user1',
        establishmentId: testEstablishmentId,
        establishmentName: 'Restaurante de Prueba',
        items: [
          { id: 'item1', name: 'Hamburguesa Especial', price: 12.99, quantity: 2 },
          { id: 'item2', name: 'Papas Fritas', price: 4.50, quantity: 1 },
        ],
        status: OrderStatus.PENDING,
        totalAmount: 30.48,
        createdAt: new Date(),
        notes: 'Sin cebolla, por favor.',
      },
      {
        id: 'test-order-2',
        userId: 'user2',
        establishmentId: testEstablishmentId,
        establishmentName: 'Restaurante de Prueba',
        items: [
          { id: 'item3', name: 'Pizza Familiar', price: 18.99, quantity: 1 },
          { id: 'item4', name: 'Refresco', price: 2.50, quantity: 2 },
        ],
        status: OrderStatus.CONFIRMED,
        totalAmount: 23.99,
        createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hora atrás
      },
      {
        id: 'test-order-3',
        userId: 'user3',
        establishmentId: testEstablishmentId,
        establishmentName: 'Restaurante de Prueba',
        items: [
          { id: 'item5', name: 'Ensalada César', price: 8.99, quantity: 1 },
        ],
        status: OrderStatus.READY,
        totalAmount: 8.99,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      }
    ];

    // Insertar órdenes de prueba
    for (const order of orderData) {
      await setDoc(doc(db, 'orders', order.id), order);
      console.log('Orden de prueba creada:', order.id);
    }

    console.log('Datos de prueba insertados correctamente');
  } catch (error) {
    console.error('Error al insertar datos de prueba:', error);
  }
};

// Función para cargar datos de prueba para el usuario actual 
export const seedDataForCurrentUser = async (userId: string): Promise<void> => {
  const db = getFirestore();

  try {
    console.log('Insertando datos de prueba para el usuario:', userId);

    // Asegurarse de que el usuario existe como establecimiento
    await setDoc(doc(db, 'establishments', userId), {
      name: 'Mi Establecimiento',
      address: 'Mi Dirección',
      phone: '123-456-7890',
      category: 'Restaurante',
      description: 'Mi establecimiento de prueba',
      rating: 4.5,
      image: 'https://firebasestorage.googleapis.com/v0/b/example/restaurant.jpg',
      createdAt: new Date(),
    }, { merge: true });
    
    console.log('Establecimiento asociado al usuario creado/actualizado');

    // Crear órdenes de prueba para este usuario como establecimiento
    const orderData = [
      {
        userId: 'customer1',
        establishmentId: userId,
        establishmentName: 'Mi Establecimiento',
        items: [
          { id: 'item1', name: 'Hamburguesa Completa', price: 13.99, quantity: 1 },
          { id: 'item2', name: 'Coca-Cola', price: 2.50, quantity: 1 },
        ],
        status: OrderStatus.PENDING,
        totalAmount: 16.49,
        createdAt: new Date(),
        notes: 'Entregar en la mesa 5',
      },
      {
        userId: 'customer2',
        establishmentId: userId,
        establishmentName: 'Mi Establecimiento',
        items: [
          { id: 'item3', name: 'Pollo a la Plancha', price: 15.99, quantity: 1 },
          { id: 'item4', name: 'Jugo Natural', price: 3.50, quantity: 1 },
        ],
        status: OrderStatus.CONFIRMED,
        totalAmount: 19.49,
        createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutos atrás
      },
      {
        userId: 'customer3',
        establishmentId: userId,
        establishmentName: 'Mi Establecimiento',
        items: [
          { id: 'item5', name: 'Pasta Carbonara', price: 14.99, quantity: 1 },
          { id: 'item6', name: 'Tiramisú', price: 6.99, quantity: 1 },
        ],
        status: OrderStatus.READY,
        totalAmount: 21.98,
        createdAt: new Date(Date.now() - 90 * 60 * 1000), // 90 minutos atrás
      }
    ];

    // Insertar órdenes de prueba
    for (const order of orderData) {
      const orderRef = doc(collection(db, 'orders'));
      await setDoc(orderRef, {
        ...order,
        id: orderRef.id
      });
      console.log('Orden de prueba creada para el usuario:', orderRef.id);
    }

    console.log('Datos de prueba para usuario insertados correctamente');
  } catch (error) {
    console.error('Error al insertar datos de prueba para el usuario:', error);
  }
}; 