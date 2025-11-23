import { Injectable } from '@angular/core';
import {
  deleteDoc,
  doc,
  Firestore,
  getDocs,
  onSnapshot,
  orderBy,
  updateDoc,
  where,
  query,
} from '@angular/fire/firestore';
import { addDoc, collection, CollectionReference } from 'firebase/firestore';
import { TClient } from './client.types';
import { getDateISOString } from '../../shared/utils/helper';
import { Observable } from 'rxjs';
import { TOrder } from '../order/order.types';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  clientCollection!: CollectionReference;
  orderCollection!: CollectionReference;
  constructor(private fireStore: Firestore) {
    this.clientCollection = collection(this.fireStore, 'clients');
    this.orderCollection = collection(this.fireStore, 'orders');
  }

  async addClient(data: TClient) {
    const reqObj = {
      ...data,
      lastUpdatedAt: getDateISOString(),
      createdAt: getDateISOString(),
    };
    await addDoc(this.clientCollection, reqObj);
  }

  async updateClient(data: TClient, id: string) {
    const reqObj = {
      ...data,
      lastUpdatedAt: getDateISOString(),
    };
    const ref = this.getDocRef(id, this.clientCollection);
    await updateDoc(ref, reqObj);
  }

  async deleteClient(id: string) {
    const ref = this.getDocRef(id, this.clientCollection);
    await deleteDoc(ref);
  }

  getAllClients(): Observable<TClient[]> {
    return new Observable((observer) => {
      // Apply the where clause

      const unsubscribe = onSnapshot(
        this.clientCollection,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as TClient[];
          observer.next(items); // Emit the data
        },
        (error) => {
          observer.error(error); // Emit the error
        }
      );

      // Cleanup subscription
      return unsubscribe;
    });
  }

  // Get a single client by ID
  getClientById(id: string): Observable<TClient> {
    return new Observable((observer) => {
      const ref = this.getDocRef(id, this.clientCollection);
      const unsubscribe = onSnapshot(
        ref,
        (docSnap) => {
          if (docSnap.exists()) {
            observer.next({ id: docSnap.id, ...docSnap.data() } as TClient);
          } else {
            observer.error('Client not found');
          }
        },
        (error) => observer.error(error)
      );
      return unsubscribe;
    });
  }

  // Get all orders for a client
  async getClientOrders(clientId: string): Promise<TOrder[]> {
    const q = query(
      this.orderCollection,
      where('client.id', '==', clientId), // dot notation for nested field
      orderBy('orderDate', 'desc')
    );

    const snapshot = await getDocs(q);
    const orders: TOrder[] = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as TOrder)
    );
    return orders;
  }

  private getDocRef(id: string, collection: CollectionReference) {
    return doc(collection, id);
  }
}
