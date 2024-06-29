import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent }    from './app.component'
import { SystemComponent } from './system/system.component'
import { EditorComponent } from './editor/editor.component'


const routes: Routes = [
  { path: "", redirectTo: "file", pathMatch: "full" },
  { path: "file", component: AppComponent },
  { path: "run",  component: SystemComponent },
  { path: "edit", component: EditorComponent }]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
