import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FreshcartStoresModel } from '../models/freshcart-stores.model';

@Injectable({ providedIn: 'root' })
export class StoresService {
  constructor(private _httpClient: HttpClient) {
  }

  getAllFreshCartStores(): Observable<FreshcartStoresModel[]> {
    return this._httpClient.get<FreshcartStoresModel[]>('https://6384fca14ce192ac60696c4b.mockapi.io/freshcart-stores');
  }

  getAllFreshCartStoresById(id: string): Observable<FreshcartStoresModel> {
    return this._httpClient.get<FreshcartStoresModel>(`https://6384fca14ce192ac60696c4b.mockapi.io/freshcart-stores/${id}`);
  }
}
