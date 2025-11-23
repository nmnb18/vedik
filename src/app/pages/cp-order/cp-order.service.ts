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
import { Observable } from 'rxjs';
import { TCpInvoice, TCpOrder } from './cp-order.types';
import {
    getCurrentFinancialYear,
    getDateISOString,
    padNumber,
} from '../../shared/utils/helper';

@Injectable({
    providedIn: 'root',
})
export class CpOrderService {
    cpOrderCollection!: CollectionReference;
    cpInvoiceCollection!: CollectionReference;
    cpPaymentCollection!: CollectionReference;

    constructor(private fireStore: Firestore) {
        this.cpOrderCollection = collection(this.fireStore, 'cp_orders');
        this.cpInvoiceCollection = collection(this.fireStore, 'cp_invoice');
        this.cpPaymentCollection = collection(this.fireStore, 'cp_payments');
    }

    async addOrder(data: TCpOrder) {
        const reqObj = {
            ...data,
            lastUpdatedAt: getDateISOString(),
            createdAt: getDateISOString(),
        };
        await addDoc(this.cpOrderCollection, reqObj);
    }

    async updateOrder(data: TCpOrder, id: string | undefined) {
        if (!id) return;
        const docRef = this.getDocRef(id, this.cpOrderCollection);
        await setDoc(docRef, { ...data, lastUpdatedAt: getDateISOString() });
    }

    async updateOrderValue(id: string, data: Partial<TCpOrder>) {
        const ref = this.getDocRef(id, this.cpOrderCollection);
        return updateDoc(ref, { ...data });
    }

    async updateInvoice(data: TCpOrder, id: string) {
        if (!data.id) return;
        const docRef = this.getDocRef(id, this.cpInvoiceCollection);

        const reqObj = {
            orderDetails: data,
            orderId: data.orderId,
            lastUpdatedAt: getDateISOString(),
        };

        await setDoc(docRef, reqObj);
    }

    async addInvoice(data: TCpOrder) {
        const snapshot = await getCountFromServer(this.cpInvoiceCollection);
        const number = padNumber(snapshot.data().count + 1);

        const reqObj = {
            orderDetails: data,
            orderId: data.orderId,
            lastUpdatedAt: getDateISOString(),
            createdAt: getDateISOString(),
            invoiceNo: `CP/${getCurrentFinancialYear()}/${number}`,
        };

        await addDoc(this.cpInvoiceCollection, reqObj);
    }

    async updatePayment(key: string, gTotal: number, type: string) {
        const q = query(this.cpPaymentCollection, where('name', '==', key));
        const snap = await getDocs(q);

        const paymentRef = doc(collection(this.fireStore, 'cp_payments'));

        if (snap.empty) {
            await setDoc(paymentRef, {
                name: key,
                totalPayment: Number(gTotal || 0),
                receivedPayment: 0,
            });
        } else {
            const paymentDoc = snap.docs[0].ref;

            await runTransaction(this.fireStore, async (transaction) => {
                const paymentSnap = await transaction.get(paymentDoc);
                const current = paymentSnap.data() as any;

                const totalP =
                    type === 'Delete'
                        ? (current.totalPayment || 0) - Number(gTotal)
                        : (current.totalPayment || 0) + Number(gTotal);

                transaction.update(paymentDoc, { totalPayment: totalP });
            });
        }
    }

    getInvoiceFromOrderId(orderId: string | undefined): Observable<TCpInvoice[]> {
        return new Observable((observer) => {
            const q = query(this.cpInvoiceCollection, where('orderId', '==', orderId));

            const unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    const items = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as TCpInvoice[];

                    observer.next(items);
                },
                (error) => observer.error(error)
            );

            return unsubscribe;
        });
    }

    getAllOrders(): Observable<TCpOrder[]> {
        return new Observable((observer) => {
            const unsubscribe = onSnapshot(
                this.cpOrderCollection,
                (snapshot) => {
                    const items = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as TCpOrder[];

                    observer.next(items);
                },
                (error) => observer.error(error)
            );

            return unsubscribe;
        });
    }

    private getDocRef(id: string, collection: CollectionReference) {
        return doc(collection, id);
    }
}
