import { Injectable } from '@angular/core';
import {
  doc,
  Firestore,
  getCountFromServer,
  getDocs,
  onSnapshot,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { addDoc, collection, CollectionReference } from 'firebase/firestore';
import {
  getCurrentFinancialYear,
  getDateISOString,
  padNumber,
} from '../../shared/utils/helper';
import { Observable } from 'rxjs';
import { TInvoice, TOrder } from './order.types';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  orderCollection!: CollectionReference;
  invoiceCollection!: CollectionReference;
  paymentCollection!: CollectionReference;
  constructor(private fireStore: Firestore) {
    this.orderCollection = collection(this.fireStore, 'orders');
    this.invoiceCollection = collection(this.fireStore, 'invoice');
    this.paymentCollection = collection(this.fireStore, 'payments');
  }

  async addOrder(data: TOrder) {
    const reqObj = {
      ...data,
      lastUpdatedAt: getDateISOString(),
      createdAt: getDateISOString(),
    };
    await addDoc(this.orderCollection, reqObj);
  }

  async updateOrder(data: TOrder, id: string | undefined) {
    if (!id) return;
    const docRef = this.getDocRef(id, this.orderCollection);
    await setDoc(docRef, { ...data, lastUpdatedAt: getDateISOString() });
  }

  async updateOrderValue(id: string, data: Partial<TOrder>) {
    const ref = this.getDocRef(id, this.orderCollection);
    return updateDoc(ref, { ...data });
  }

  async updateInvoice(data: TOrder, id: string) {
    if (!data.id) return;
    const docRef = this.getDocRef(id, this.invoiceCollection);
    const reqObj = {
      orderDetails: data,
      orderId: data.orderId,
      lastUpdatedAt: getDateISOString(),
    };
    await setDoc(docRef, { ...reqObj, lastUpdatedAt: getDateISOString() });
  }

  async addInvoice(data: TOrder) {
    const snapshot = await getCountFromServer(this.invoiceCollection);
    const number = padNumber(snapshot.data().count + 1);
    const reqObj = {
      orderDetails: data,
      orderId: data.orderId,
      lastUpdatedAt: getDateISOString(),
      createdAt: getDateISOString(),
      invoiceNo: `VH/${getCurrentFinancialYear()}/${number}`,
    };
    await addDoc(this.invoiceCollection, reqObj);
  }

  async updatePayment(key: string, gTotal: number, type: string) {
    const q = query(this.paymentCollection, where('name', '==', key));
    const snap = await getDocs(q);
    const paymentRef = doc(collection(this.fireStore, 'payments'));
    if (snap.empty) {
      await setDoc(paymentRef, {
        name: key,
        totalPayment: Number(gTotal || 0),
        receivedPayment: 0
      })
    } else {
      const paymentDoc = snap.docs[0].ref;
      await runTransaction(this.fireStore, async (transaction) => {
        const paymentSnap = await transaction.get(paymentDoc);

        const current = paymentSnap.data() as any;
        const totalP = type === 'Delete' ? (current.totalPayment || 0) - Number(gTotal || 0) : (current.totalPayment || 0) + Number(gTotal || 0)
        transaction.update(paymentDoc, {
          totalPayment: totalP,
        });
      });
    }
  }

  getInvoiceFromOrderId(orderId: string | undefined): Observable<TInvoice[]> {
    return new Observable((observer) => {
      const q = query(this.invoiceCollection, where('orderId', '==', orderId)); // Apply the where clause

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as TInvoice[];
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

  getAllOrders(): Observable<TOrder[]> {
    return new Observable((observer) => {
      // Apply the where clause

      const unsubscribe = onSnapshot(
        this.orderCollection,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as TOrder[];
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

  private getDocRef(id: string, collection: CollectionReference) {
    return doc(collection, id);
  }
}
