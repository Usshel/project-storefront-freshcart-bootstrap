import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FreshcartCategoriesModel } from '../models/freshcart-categories.model';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  constructor(private _httpClient: HttpClient) {
  }

  getAllFreshCartCategories(): Observable<FreshcartCategoriesModel[]> {
    return this._httpClient.get<FreshcartCategoriesModel[]>('https://6384fca14ce192ac60696c4b.mockapi.io/freshcart-categories');
  }

  getAllFreshCartCategoriesById(id: string): Observable<FreshcartCategoriesModel> {
    return this._httpClient.get<FreshcartCategoriesModel>(`https://6384fca14ce192ac60696c4b.mockapi.io/freshcart-categories/${id}`);
  }
}
