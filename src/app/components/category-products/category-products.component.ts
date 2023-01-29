import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, combineLatest, of } from 'rxjs';
import { debounceTime, filter, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
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
  //hardCoded sort options
  readonly sort$: Observable<string[]> = of(['Featured', 'Price: Low to High', 'Price: High to Low', 'Avg.rating'])

  //sort form
  readonly sort: FormGroup = new FormGroup({ sortOption: new FormControl() });

  //filter price form
  readonly filterPrice: FormGroup = new FormGroup({ priceFrom: new FormControl(), priceTo: new FormControl() });


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

  onFilterPriceSubmitted(filterPrice: FormGroup): void {
  }

  //category for particular site by params
  readonly categorySite$: Observable<CategoryModel[]> = combineLatest([
    this.categories$,
    this.categoryIdParams$,
  ]).pipe(map(([categories, categoryParamsId]) =>
    categories.filter(category => category.id == categoryParamsId)))


  // all stores
  readonly stores$: Observable<StoreModel[]> = this._storesService.getAllFreshCartStores();



  //all Products by Category
  readonly products$: Observable<ProductModel[]> = combineLatest([
    this._productsService.getAllFreshCartProducts(),
    this.categoryIdParams$,
  ]).pipe(map(([products, categoryParsId]) =>
    products.filter((product) => product.categoryId == categoryParsId)
  ));

  //Products SortedAndFilteredByPrice
  readonly productsSorted$: Observable<ProductModel[]> = combineLatest([
    this.products$,
    this.sort.valueChanges.pipe(
      startWith('')),
    this.filterPrice.valueChanges.pipe(
      debounceTime(3000),
      startWith(
        {priceFrom: 1, priceTo: 1000}
        
      ))
  ]).pipe(
    map(([products, sortForm, priceF]) => 
      products.filter(product => 
        priceF.priceFrom && priceF.priceTo ? product.price >= priceF.priceFrom && product.price < priceF.priceTo : 
        priceF.priceFrom ? product.price >= priceF.priceFrom :
        priceF.priceTo ? product.price <= priceF.priceTo :
        product
        )
      .sort((productA, productB) => {
        if (sortForm.sortOption === 'Featured') {
          if (productA.featureValue > productB.featureValue) return sortForm.sortOption == 'Featured' ? -1 : 1;
        }
        if (sortForm.sortOption === 'Price: Low to High' || sortForm.sortOption === 'Price: High to Low') {
          if (productA.price > productB.price) return sortForm.sortOption == 'Price: Low to High' ? 1 : -1;
          if (productA.price < productB.price) return sortForm.sortOption == 'Price: High to Low' ? 1 : -1;
        }
        if (sortForm.sortOption === 'Avg.rating') {
          if (productA.ratingValue > productB.ratingValue) return sortForm.sortOption == 'Avg.rating' ? -1 : 1;
        }
        return 0
      }
      )
    )
  )

  constructor(private _categoriesService: CategoriesService, private _activatedRoute: ActivatedRoute, private _productsService: ProductsService, private _storesService: StoresService) {
  }




}
