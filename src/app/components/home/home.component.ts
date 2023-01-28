import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Observable, combineLatest, map, shareReplay, of, tap } from 'rxjs';
import { CategoryModel } from '../../models/freshcart-categories.model';
import { StoreQuerymodel } from '../../querymodels/store.querymodel';
import { ProductModel } from '../../models/freshcart-products.model';
import { CategoriesService } from '../../services/categories.service';
import { StoresService } from '../../services/stores.service';
import { ProductsService } from '../../services/products.service';
import { CategoryWithProductQuerymodel } from 'src/app/querymodels/category-with-product.querymodel';

@Component({
  selector: 'app-home',
  styleUrls: ['./home.component.scss'],
  templateUrl: './home.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  readonly categories$: Observable<CategoryModel[]> = this._categoriesService.getAllFreshCartCategories().pipe(shareReplay(1));
  

  readonly stores$: Observable<StoreQuerymodel[]> = combineLatest([
    this._storesService.getAllFreshCartStores(),
    this._storesService.getAllStoreTags()
  ]).pipe(
    map(([stores, storeTags]) =>
      stores.map((store) => {
        return {
          name: store.name,
          logoUrl: store.logoUrl,
          distanceInMeters: Math.round((store.distanceInMeters / 100)) / 10,
          tags: (store.tagIds ?? []).map((tagId) => storeTags[tagId]?.name),
          id: store.id
        }
      }
      )), shareReplay(1)
  );
    //5 fruits and Vege id 2 snack and munchies
    readonly categoriesId$: Observable<string[]> = of(['5','2'])

  readonly categoriesWithProducts$: Observable<CategoryWithProductQuerymodel[]> = combineLatest([
    this.categories$,
    this.categoriesId$,
    this._productsService.getAllFreshCartProducts()
  ]).pipe(
    map(([categories, categoriesId, products]) =>{
       return this._mapToNewCategoryQuery(categories, categoriesId, products)
      })
      )
    



  
  

  constructor(private _categoriesService: CategoriesService, private _storesService: StoresService, private _productsService: ProductsService) {
  }

   private _mapToNewCategoryQuery(
    categories:CategoryModel[],
    categoriesId: string[],
    products: ProductModel[]): 
    CategoryWithProductQuerymodel[] {
      
      const categoiresMap = categories.reduce((a,category)=>({...a, [category.id]: category}), {} as Record<string,CategoryModel>)
      return categoriesId.map((id) =>{
        return {
          name: categoiresMap[id]?.name,
          products: products.filter((product) => product.categoryId == id).slice(0,5).sort((a,b) => b.featureValue > a.featureValue ? 1 : -1  ) 
          
        }
      } )
      
    }
}
