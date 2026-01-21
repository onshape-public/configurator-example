import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
// Bootstrap and FontAwesome
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

//
import { AppComponent } from './app.component';
import { ConfiguratorModule } from './configurator/configurator.module';
import { ThreeToolsModule } from './three-tools/three-tools.module';
import { ThreeModule } from './three/three.module';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { ChatModule } from './chat/chat.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ConfiguratorModule,
    NgbModule,
    FontAwesomeModule,
    ThreeToolsModule,
    ThreeModule,
    AppRoutingModule,
    ChatModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {
    library.add(fas);
  }
}
