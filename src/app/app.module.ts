import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { MyFirstComponentComponent } from './my-first-component/my-first-component.component';
import { InventoryComponent } from './inventory/inventory.component';
import { InventoryColumnComponent } from './inventory-column/inventory-column.component';
import { InventoryWorkitemComponent } from './inventory-workitem/inventory-workitem.component';
import { FlowArrowComponent } from './flow-arrow/flow-arrow.component';
import { ProcessStepComponent } from './process-step/process-step.component';
import { ValueChainComponent } from './value-chain/value-chain.component';
import { NgxSliderModule } from '@angular-slider/ngx-slider';

@NgModule({
  declarations: [
    AppComponent,
    MyFirstComponentComponent,
    InventoryComponent,
    InventoryColumnComponent,
    InventoryWorkitemComponent,
    FlowArrowComponent,
    ProcessStepComponent,
    ValueChainComponent
  ],
  imports: [
    BrowserModule,
    NgxSliderModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
