import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent }   from './home/home.component'
import { SystemComponent } from './system/system.component'
import { EditorComponent } from './editor/editor.component'


const routes: Routes = [
  { path: "", redirectTo: "home", pathMatch: "full" },
  { path: "file", redirectTo: "home", pathMatch: "full" },
  { path: "home",  component: HomeComponent },
  { path: "run",  component: SystemComponent },
  { path: "edit", component: EditorComponent }]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
