import { Injectable } from '@angular/core';
import { Firestore, onSnapshot } from '@angular/fire/firestore';
import { addDoc, collection, CollectionReference } from 'firebase/firestore';
import { getDateISOString } from '../../shared/utils/helper';
import { Observable } from 'rxjs';
import { TTransport } from './transport.types';

@Injectable({
  providedIn: 'root',
})
export class TransportService {
  transportCollection!: CollectionReference;
  constructor(private fireStore: Firestore) {
    this.transportCollection = collection(this.fireStore, 'transport');
  }

  async addTransport(data: TTransport) {
    const reqObj = {
      ...data,
      lastUpdatedAt: getDateISOString(),
      createdAt: getDateISOString(),
    };
    await addDoc(this.transportCollection, reqObj);
  }

  getAllTransport(): Observable<TTransport[]> {
    return new Observable((observer) => {
      // Apply the where clause

      const unsubscribe = onSnapshot(
        this.transportCollection,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as TTransport[];
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
}
