import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { StoreModel } from '../models/freshcart-stores.model';
import { StoreTagModel } from '../models/store-tags.model';
@Injectable({ providedIn: 'root' })
export class StoresService {
  constructor(private _httpClient: HttpClient) {
  }

  getAllFreshCartStores(): Observable<StoreModel[]> {
    return this._httpClient.get<StoreModel[]>('https://6384fca14ce192ac60696c4b.mockapi.io/freshcart-stores');
  }

  getAllFreshCartStoresById(id: string): Observable<StoreModel> {
    return this._httpClient.get<StoreModel>('https://6384fca14ce192ac60696c4b.mockapi.io/freshcart-stores/'+ id);
  }

  getAllStoreTags(): Observable<Record <string, StoreTagModel>> {
    return this._httpClient.get<StoreTagModel[]>('https://6384fca14ce192ac60696c4b.mockapi.io/freshcart-store-tags').pipe(
      map((tags) => tags.reduce((a,c) =>({...a,[c.id]: c}),{} as Record <string, StoreTagModel>)  )
    )
  }
}
