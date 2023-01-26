import { Component } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FreshcartCategoriesModel } from './models/freshcart-categories.model';
import { FreshcartStoresModel } from './models/freshcart-stores.model';
import { CategoriesService } from './services/categories.service';
import { StoresService } from './services/stores.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ng-freshcard-bootstrap-theme';
  readonly categories$: Observable<FreshcartCategoriesModel[]> = this._categoriesService.getAllFreshCartCategories();
  readonly stores$: Observable<FreshcartStoresModel[]> = this._storesService.getAllFreshCartStores();
  readonly getToKnowUs$: Observable<string[]> = of(['Company','About','Blog','Help Center','Our Value']) ;

  constructor(private _categoriesService: CategoriesService, private _storesService: StoresService) {
  }
}
