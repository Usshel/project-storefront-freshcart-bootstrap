import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { ProductModel } from '../../models/freshcart-products.model';
import { StoreModel } from '../../models/freshcart-stores.model';
import { StoresService } from '../../services/stores.service';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-store-products',
  styleUrls: ['./store-products.component.scss'],
  templateUrl: './store-products.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreProductsComponent {


  readonly search: FormGroup = new FormGroup({ productSearch: new FormControl() });

  //observable params
  readonly storeData$: Observable<string> = this._activatedRoute.params.pipe(
    map((params) => params['storeId']),
    shareReplay(1),
    tap(console.log)
  )

//products filtered by store + searching  
  readonly products$: Observable<ProductModel[]> = combineLatest([
    this._productsService.getAllFreshCartProducts(),
    this.storeData$,
    this.search.valueChanges.pipe(
      startWith({ productSearch: '' })
    )
    ]).pipe(
      map(([products, params, search]) => products.filter((product) => product.storeIds.includes(params))
    .filter(product =>
       product.name.toLowerCase().includes(search.productSearch.toLowerCase()))
  ), );

//One store Object
  readonly store$: Observable<StoreModel> = this.storeData$
  .pipe(switchMap((params) => this._storesService.getAllFreshCartStoresById(params)
      .pipe( 
        map((store) => {
          return {
            name: store.name,
            logoUrl: store.logoUrl,
            distanceInMeters: Math.round((store.distanceInMeters / 100)) / 10,
            tagIds: store.tagIds,
            id: store.id
          }
        }))
      ));

  constructor(private _storesService: StoresService, private _activatedRoute: ActivatedRoute, private _productsService: ProductsService) {
  }

  onSearchSubmitted(search: FormGroup): void {
  }
}
