import { Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  CollectionReference,
  doc,
  Firestore,
  getCountFromServer,
  getDoc,
  setDoc,
} from '@angular/fire/firestore';
import { TProduct } from './product.type';
import { Observable } from 'rxjs';
import { getDateISOString } from '../../shared/utils/helper';
import { addDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  productCollection!: CollectionReference;
  constructor(private fireStore: Firestore) {
    this.productCollection = collection(this.fireStore, 'products');
  }

  getProducts(): Observable<any> {
    return collectionData(this.productCollection, { idField: 'id' }); // Fetch all users
  }

  async addProduct(data: TProduct) {
    const reqObj = {
      ...data,
      lastUpdatedAt: getDateISOString(),
      createdAt: getDateISOString(),
    };
    await addDoc(this.productCollection, reqObj);
  }

  private getDocRef() {
    return doc(this.productCollection);
  }
}
