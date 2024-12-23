//-------------------------------------------------------------------
// APP ROUTING MODULE
//-------------------------------------------------------------------
// last code cleaning: 23.12.2024

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent }   from './home/home.component'
import { SystemComponent } from './system/system.component'
import { EditorComponent } from './editor/editor.component'
import { AuthGuard } from './shared/auth.guard'


/** routes to the 3 sub pages of the applications */
const routes: Routes = [
  { path: "", redirectTo: "home", pathMatch: "full" },
  { path: "home", component: HomeComponent },
  { path: "run",  component: SystemComponent, canActivate: [AuthGuard] },
  { path: "edit", component: EditorComponent },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
