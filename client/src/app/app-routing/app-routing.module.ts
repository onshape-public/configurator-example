import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfiguratorComponent } from '../configurator/configurator/configurator.component';

const appRoutes: Routes = [{ path: 'configurator/:did/:wvm/:wvmid/e/:eid', component: ConfiguratorComponent },
  { path: '**', redirectTo: 'configurator/9558507b2d8feaea012281be/v/ef47a69cee64730a99017b43/e/a8d9da8f108b44b9fa903800' }];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    RouterModule
  ],
  declarations: []
})
export class AppRoutingModule { }
