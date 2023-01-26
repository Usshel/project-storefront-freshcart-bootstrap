import { Component } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
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
  readonly getToKnowUs$: Observable<string[]> = of(['Company', 'About', 'Blog', 'Help Center', 'Our Value']);
  private _isMenuOpenSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isMenuOpen$: Observable<boolean> = this._isMenuOpenSubject.asObservable();
  
  constructor(private _categoriesService: CategoriesService, private _storesService: StoresService) {
  }
  onMenuOpen(isOpen:boolean): void {
    if(isOpen === false) {
      this._isMenuOpenSubject.next(false)
    }else
    {
      this._isMenuOpenSubject.next(true)
    }
    
  }

  

}

