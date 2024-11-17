import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, /* HttpClientModule, HTTP_INTERCEPTORS, */ provideHttpClient, withInterceptors } from '@angular/common/http'

import { PublicClientApplication, IPublicClientApplication } from "@azure/msal-browser"
import { MsalModule, MsalService, MSAL_INSTANCE } from "@azure/msal-angular";

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { environment } from '../environments/environment'

import { addAuthTokenToHttpHeader$, handleResponseError$ } from './shared/http-interceptor-functions'


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
import { EventsDisplayComponent } from './events-display/events-display.component';
import { HomeComponent } from './home/home.component';

/*
const routes: Routes = [
  { path: 'simulate', component: SystemComponent },
  { path: 'learn-stats', component: LearnStatsComponent },
  { path: '', redirectTo: '/simulate', pathMatch: 'full'}
]
*/

export function MsalInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
      auth: {
        clientId:     environment.msalConfig.clientId,  // id of this application i.e. the Angular front end
        authority:    environment.msalConfig.authority,
        redirectUri:  environment.msalConfig.redirectUri
      }
  })
}


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
        HomeComponent,
        EventsDisplayComponent
    ],
    imports: [
        BrowserModule,
        FormsModule, // *** really required? 
        ReactiveFormsModule,
        AppRoutingModule,
        MsalModule  // MS Authentication Library
      ], 
    providers: [
      {
        provide: MSAL_INSTANCE,
        useFactory: MsalInstanceFactory
      },
      MsalService,
      HttpClient, // *** really required?   
      provideHttpClient(withInterceptors([addAuthTokenToHttpHeader$, handleResponseError$]))
      // provideHttpClient(withInterceptorsFromDi())
    ],    
    bootstrap: [AppComponent] 
  })
export class AppModule { }
