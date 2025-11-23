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
import { TExpense } from './expense.types';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  expenseCollection!: CollectionReference;
  constructor(private fireStore: Firestore) {
    this.expenseCollection = collection(this.fireStore, 'expense');
  }

  async addExpense(data: TExpense) {
    const reqObj = {
      ...data,
      lastUpdatedAt: getDateISOString(),
      createdAt: getDateISOString(),
    };
    await addDoc(this.expenseCollection, reqObj);
  }

  async updateExpense(data: TExpense, id: string) {
    const reqObj = {
      ...data,
      lastUpdatedAt: getDateISOString(),
    };
    const ref = this.getDocRef(id, this.expenseCollection);
    await updateDoc(ref, reqObj);
  }

  getAllExpense(): Observable<TExpense[]> {
    return new Observable((observer) => {
      // Apply the where clause

      const unsubscribe = onSnapshot(
        this.expenseCollection,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as TExpense[];
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
