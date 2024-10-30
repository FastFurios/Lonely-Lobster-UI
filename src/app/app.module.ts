import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
//import { RouterModule, Routes } from '@angular/router' // see https://www.samjulien.com/add-routing-existing-angular-project

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

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
import { FlowStatsComponent } from './flow-stats/flow-stats.component';
import { SystemStatsComponent } from './system-stats/system-stats.component';
import { LearnStatsComponent } from './learn-stats/learn-stats.component';
import { ColorLegendComponent } from './color-legend/color-legend.component';
import { EditorComponent } from './editor/editor.component';
import { EditorMessagesComponent } from './editor-messages/editor-messages.component';
import { HomeComponent } from './home/home.component';

/*
const routes: Routes = [
  { path: 'simulate', component: SystemComponent },
  { path: 'learn-stats', component: LearnStatsComponent },
  { path: '', redirectTo: '/simulate', pathMatch: 'full'}
]
*/

@NgModule({ declarations: [
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
        WorkerStrainComponent,
        FlowStatsComponent,
        SystemStatsComponent,
        LearnStatsComponent,
        ColorLegendComponent,
        EditorComponent,
        EditorMessagesComponent,
        HomeComponent
    ],
    bootstrap: [AppComponent], 
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule], 
    providers: [provideHttpClient(withInterceptorsFromDi())] })
export class AppModule { }
