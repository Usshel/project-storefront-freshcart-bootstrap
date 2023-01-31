import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, combineLatest, from, of } from 'rxjs';
import { debounceTime, filter, map, shareReplay, startWith, switchMap, take, tap } from 'rxjs/operators';
import { PagedataQuerymodel } from '../../querymodels/pagedata.querymodel';
import { CategoryModel } from '../../models/freshcart-categories.model';
import { StoreModel } from '../../models/freshcart-stores.model';
import { ProductWithStarsQuerymodel } from '../../querymodels/product-with-stars.querymodel';
import { CategoriesService } from '../../services/categories.service';
import { ProductsService } from '../../services/products.service';
import { StoresService } from '../../services/stores.service';
import { ProductModel } from '../../models/freshcart-products.model';

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
  //search for store form
  readonly searchStore: FormGroup = new FormGroup({ store: new FormControl() });
  //filter price form
  readonly filterPrice: FormGroup = new FormGroup({ priceFrom: new FormControl(), priceTo: new FormControl() });

  //page limit
  readonly pageLimit$: Observable<number[]> = of([5, 10, 15])

  readonly pageData$: Observable<PagedataQuerymodel> =
    this._activatedRoute.queryParams.pipe(
      map((params) => {
        return {
          pageNumber: params['pageNumber'] ? +params['pageNumber'] : 1,
          pageSize: params['pageSize'] ? +params['pageSize'] : 5
        };
      })
    )

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
    this.categoryIdParams$,
  ]).pipe(map(([categories, categoryParamsId]) =>
    categories.filter(category => category.id == categoryParamsId)))


  // all stores with searching 
  readonly storesWithSearching$: Observable<StoreModel[]> = combineLatest([
    this._storesService.getAllFreshCartStores(),
    this.searchStore.valueChanges
      .pipe(debounceTime(1000),
        startWith(''))
  ]).pipe(
    map(([stores, searchStore]) => stores.filter((store) =>
      searchStore.store ?
        store.name.toLowerCase().includes(searchStore.store.toLowerCase()) :
        store.name.toLowerCase().includes('')
    ))
  );


  //all Products by Category With Stars
  readonly products$: Observable<ProductWithStarsQuerymodel[]> = combineLatest([
    this._productsService.getAllFreshCartProducts(),
    this.categoryIdParams$,
  ]).pipe(map(([products, categoryParsId]) =>
    products.filter((product) => product.categoryId == categoryParsId).map((product) => this.mapProductsToQueryWithStars(product))
  ));

  //Products SortedAndFilteredByPrice
  readonly productsSorted$: Observable<ProductWithStarsQuerymodel[]> = combineLatest([
    this.products$,
    this.sort.valueChanges.pipe(
      startWith('')),
    this.filterPrice.valueChanges.pipe(
      debounceTime(2000),
      startWith(
        { priceFrom: 1, priceTo: 1000 }

      )),
    this.pageData$
  ]).pipe(
    map(([products, sortForm, priceF, params]) =>
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
        ).slice((params.pageNumber - 1) * params.pageSize, params.pageNumber * params.pageSize)
    )
  )


  readonly pages$: Observable<number[]> = combineLatest([
    this.pageData$,
    this.products$
  ]).pipe(map(([params, products]) => {
    return Array.from(
      Array(Math.ceil(products.length / params.pageSize)).keys()).map((index) => index + 1)
  }))


  constructor(private _categoriesService: CategoriesService, private _activatedRoute: ActivatedRoute, private _productsService: ProductsService, private _storesService: StoresService, private _router: Router) {
  }

  onPageChanged(page: number): void {
    this.pageData$.pipe(
      take(1),
      tap((params) => {
        this._router.navigate([], {
          queryParams: {
            pageNumber: page,
            pageSize: params.pageSize
          }
        })
      })
    ).subscribe()
  }

  onPageSizeChanged(Size: number): void {
    combineLatest([
      this.pageData$,
      this.productsSorted$
    ]).pipe(take(1),
      tap(([params, products]) => {
        this._router.navigate([], {
          queryParams: {
            pageNumber: Math.min(
              Math.ceil(products.length / Size), params.pageNumber
            ),
            pageSize: Size

          }
        })
      })
    ).subscribe()

  }

  onCategoryChanged(categoryId: string): void {
    this._router.navigate(['/categories/' + categoryId]), {

    }

  }

  stars(rating: number): number[] {
    let starsArr = [];

    for (let i = 1; i <= 5; i++) {
      Math.floor(rating) >= i ? starsArr.push(1) :
        Math.ceil(rating) >= i ? starsArr.push(0.5) : starsArr.push(0)
    }
    return starsArr

  }
  mapProductsToQueryWithStars(product: ProductModel): ProductWithStarsQuerymodel {
    return {
      categoryId: product.categoryId,
      featureValue: product.featureValue,
      id: product.id,
      imageUrl: product.imageUrl,
      name: product.name,
      price: product.price,
      ratingCount: product.ratingCount,
      ratingValue: this.stars(product.ratingValue),
      storeIds: product.storeIds
    }
  }




}




/* [ngClass]="{'bi-star-fill': val === 1, 'bi-star': val === 0, 'bi-star-half': val === 0.5}"
    5 stars - possible: 1, 0, 0.5;
    have to return array with 5 elements ex[1,1,1,0.5,0]
    if  val>0 && val< 1 return 0,5
    if  val === 1 return 1 if val===0 return 0

*/
