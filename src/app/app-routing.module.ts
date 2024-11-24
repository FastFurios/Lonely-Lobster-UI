import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent }   from './home/home.component'
import { SystemComponent } from './system/system.component'
import { EditorComponent } from './editor/editor.component'
import { EventsDisplayComponent } from './events-display/events-display.component'
import { AuthGuard } from './shared/auth.guard'



const routes: Routes = [
  { path: "", redirectTo: "home", pathMatch: "full" },
//  { path: "file", redirectTo: "home", pathMatch: "full" },
  { path: "home", component: HomeComponent },
//{ path: "run",  component: SystemComponent },
  { path: "run",  component: SystemComponent, canActivate: [AuthGuard] },
  { path: "edit", component: EditorComponent },
  // { path: "events", component: EventsDisplayComponent },
  
 // { path: "events-download", redirectTo: "home", pathMatch: "full" }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
