import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { MyFirstComponentComponent } from './my-first-component/my-first-component.component';
import { InventoryComponent } from './inventory/inventory.component';
import { InventoryColumnComponent } from './inventory-column/inventory-column.component';
import { InventoryWorkitemComponent } from './inventory-workitem/inventory-workitem.component';

@NgModule({
  declarations: [
    AppComponent,
    MyFirstComponentComponent,
    InventoryComponent,
    InventoryColumnComponent,
    InventoryWorkitemComponent
  ],
  imports: [
    BrowserModule 
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
