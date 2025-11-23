import { Injectable } from '@angular/core';
import {
    doc,
    Firestore,
    getDoc,
    onSnapshot,
    updateDoc,
} from '@angular/fire/firestore';
import { addDoc, collection, CollectionReference } from 'firebase/firestore';
import { getDateISOString } from '../../shared/utils/helper';
import { Observable } from 'rxjs';
import { TPayments } from './payments.types';
import { TOrder } from '../order/order.types';

@Injectable({
    providedIn: 'root',
})
export class PaymentService {
    paymentsCollection!: CollectionReference;
    orderCollection!: CollectionReference;
    constructor(private fireStore: Firestore) {
        this.paymentsCollection = collection(this.fireStore, 'payments');
        this.orderCollection = collection(this.fireStore, 'orders');
    }

    async addPayment(data: TPayments) {
        const reqObj = {
            ...data,
            lastUpdatedAt: getDateISOString(),
            createdAt: getDateISOString(),
        };
        await addDoc(this.paymentsCollection, reqObj);
    }

    async updatePayment(data: TPayments, id: string) {
        const reqObj = {
            ...data,
            lastUpdatedAt: getDateISOString(),
        };
        const ref = this.getDocRef(id, this.paymentsCollection);
        await updateDoc(ref, reqObj);
    }

    getAllPayments(): Observable<TPayments[]> {
        return new Observable((observer) => {
            // Apply the where clause

            const unsubscribe = onSnapshot(
                this.paymentsCollection,
                (snapshot) => {
                    const items = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as TPayments[];
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
