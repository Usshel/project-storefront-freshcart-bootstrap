import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductModel } from '../models/freshcart-products.model';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  constructor(private _httpClient: HttpClient) {
  }

  getAllFreshCartProducts(): Observable<ProductModel[]> {
    return this._httpClient.get<ProductModel[]>('https://6384fca14ce192ac60696c4b.mockapi.io/freshcart-products');
  }
}
