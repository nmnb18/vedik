import { Injectable } from '@angular/core';
import {
  Firestore,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import {
  addDoc,
  collection,
  CollectionReference,
  doc,
} from 'firebase/firestore';
import { getDateISOString } from '../../shared/utils/helper';
import { Observable } from 'rxjs';
import { TStock } from './stock.types';

@Injectable({
  providedIn: 'root',
})
export class StockService {
  stockCollection!: CollectionReference;
  constructor(private fireStore: Firestore) {
    this.stockCollection = collection(this.fireStore, 'stock');
  }

  async addStock(data: TStock) {
    const reqObj = {
      ...data,
      lastUpdatedAt: getDateISOString(),
      createdAt: getDateISOString(),
    };
    await addDoc(this.stockCollection, reqObj);
  }

  getAllStock(): Observable<TStock[]> {
    return new Observable((observer) => {
      // Apply the where clause

      const unsubscribe = onSnapshot(
        this.stockCollection,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as TStock[];
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

  async updateStock(productId: string, quantity: number, size: string) {
    let orderQuantity = quantity;
    const q = query(
      this.stockCollection,
      where('productId', '==', productId),
      where('remainingQuantity', '>=', 0),
      orderBy('createdAt')
    ); // Apply the where clause
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (orderDoc) => {
      if (orderQuantity <= 0) return;
      const data = orderDoc.data();
      let remainingQuantity = data['remainingQuantity'];
      const tempRemaining = data['remainingQuantity'] - orderQuantity;
      if (tempRemaining > 0) {
        remainingQuantity = tempRemaining;
        orderQuantity = 0;
      } else {
        remainingQuantity = 0;
        orderQuantity = Math.abs(tempRemaining);
      }
      const docRef = doc(this.stockCollection, orderDoc.id);

      await updateDoc(docRef, {
        remainingQuantity: remainingQuantity,
        lastUpdatedAt: getDateISOString(),
      });
    });
  }

  async getStockByProductId(productId: string) {
    let remainingQuantity: number = 0;
    let batchNo: string = '';
    const q = query(
      this.stockCollection,
      where('productId', '==', productId),
      where('remainingQuantity', '>=', 0)
    ); // Apply the where clause
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (orderDoc) => {
      const data = orderDoc.data();
      remainingQuantity = remainingQuantity + data['remainingQuantity'];
      batchNo = data['batchNo'];
    });
    return {
      remainingQuantity,
      batchNo,
    };
  }
}
