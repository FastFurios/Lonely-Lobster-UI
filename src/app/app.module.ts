import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';


import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { InventoryComponent } from './inventory/inventory.component';
import { InventoryColumnComponent } from './inventory-column/inventory-column.component';
import { InventoryWorkitemComponent } from './inventory-workitem/inventory-workitem.component';
import { FlowArrowComponent } from './flow-arrow/flow-arrow.component';
import { ProcessStepComponent } from './process-step/process-step.component';
import { ValueChainComponent } from './value-chain/value-chain.component';
import { SystemComponent } from './system/system.component';
import { WorkerComponent } from './worker/worker.component';
import { WorkersStatsComponent } from './workers-stats/workers-stats.component';
import { OutputBasketComponent } from './output-basket/output-basket.component';
import { TestParentComponent } from './test-parent/test-parent.component';
import { TestChildComponent } from './test-child/test-child.component';
import { WorkerStrainComponent } from './worker-strain/worker-strain.component';

@NgModule({
  declarations: [
    AppComponent,
    InventoryComponent,
    InventoryColumnComponent,
    InventoryWorkitemComponent,
    FlowArrowComponent,
    ProcessStepComponent,
    ValueChainComponent,
    SystemComponent,
    WorkerComponent,
    WorkersStatsComponent,
    OutputBasketComponent,
    TestParentComponent,
    TestChildComponent,
    WorkerStrainComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
