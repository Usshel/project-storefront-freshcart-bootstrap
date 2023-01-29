import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Observable, of } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { CategoryModel } from '../../models/freshcart-categories.model';
import { StoreModel } from '../../models/freshcart-stores.model';
import { ProductModel } from '../../models/freshcart-products.model';
import { CategoriesService } from '../../services/categories.service';
import { ProductsService } from '../../services/products.service';
import { StoresService } from '../../services/stores.service';

@Component({
  selector: 'app-category-products',
  styleUrls: ['./category-products.component.scss'],
  templateUrl: './category-products.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryProductsComponent {

  readonly sort$: Observable<string[]> = of(['Featured', 'Price: Low to High','Price: High to Low', 'Avg.rating'])

  //all categories
  readonly categories$: Observable<CategoryModel[]> = 
  this._categoriesService.getAllFreshCartCategories().pipe(
    shareReplay(1)
    );

  //category id from http params
  readonly categoryIdParams$: Observable<string> = this._activatedRoute.params.pipe(
    map((params) => params['categoryId']),
    shareReplay(1)
  )

  //category for particular site by params
  readonly categorySite$: Observable<CategoryModel[]> = combineLatest([
    this.categories$,
    this.categoryIdParams$
  ]).pipe(map(([categories,categoryParamsId]) => categories.filter(category => category.id == categoryParamsId) ))
   
  // all stores
  readonly stores$: Observable<StoreModel[]> = this._storesService.getAllFreshCartStores();



  //all Products by params
  readonly products$: Observable<ProductModel[]> = combineLatest([
    this._productsService.getAllFreshCartProducts(),
    this.categoryIdParams$
  ]).pipe(map(([products, categoryParsId]) => 
    products.filter((product) => product.categoryId == categoryParsId)), tap(console.log));

  constructor(private _categoriesService: CategoriesService, private _activatedRoute: ActivatedRoute, private _productsService: ProductsService, private _storesService: StoresService) {
  }
}
