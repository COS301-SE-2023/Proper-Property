import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { initializeApp, provideFirebaseApp, getApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth, getAuth, connectAuthEmulator } from '@angular/fire/auth';
import { initializeFirestore, provideFirestore, connectFirestoreEmulator, getFirestore, Firestore } from '@angular/fire/firestore';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideStorage, getStorage, connectStorageEmulator } from '@angular/fire/storage';
import { AuthService } from './services/auth/auth.service';
import { NgxGpAutocompleteModule } from "@angular-magic/ngx-gp-autocomplete";
import {HttpClientModule} from '@angular/common/http';
import { ReactiveFormsModule,FormsModule  } from '@angular/forms';


@NgModule({
  declarations: [AppComponent],
  imports: [
    NgxGpAutocompleteModule.forRoot({ 
      loaderOptions: { 
            apiKey: environment.googleMapsApiKey,
            libraries: ['places']
      } 
    }),
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    FormsModule ,
    ReactiveFormsModule,
    HttpClientModule,
    provideAuth(() => {
      const auth = getAuth();
      if (environment.useEmulators) {
        connectAuthEmulator(auth, 'http://localhost:9099', {
          disableWarnings: true,
        });
      }
      return auth;
    }),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => {
      let firestore: Firestore;
      if (environment.useEmulators) {
        // Long polling required for Cypress
        firestore = initializeFirestore(getApp(), {
          experimentalForceLongPolling: true,
        });
        connectFirestoreEmulator(firestore, 'localhost', 8080);
      } else {
        firestore = getFirestore();
      }
      return firestore;
    }),
    provideStorage(() => {
      const storage = getStorage();
      if (environment.useEmulators) {
        connectStorageEmulator(storage, 'localhost', 9199);
      }
      return storage;
    })
  ],
  providers: [AuthService, { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}