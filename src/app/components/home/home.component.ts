import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoryModel } from '../../models/freshcart-categories.model';
import { StoreModel } from '../../models/freshcart-stores.model';
import { CategoriesService } from '../../services/categories.service';
import { StoresService } from '../../services/stores.service';

@Component({
  selector: 'app-home',
  styleUrls: ['./home.component.scss'],
  templateUrl: './home.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  readonly categories$: Observable<CategoryModel[]> = this._categoriesService.getAllFreshCartCategories();
  readonly stores$: Observable<StoreModel[]> = this._storesService.getAllFreshCartStores();

  constructor(private _categoriesService: CategoriesService, private _storesService: StoresService) {
  }
}
