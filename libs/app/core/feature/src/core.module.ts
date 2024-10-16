import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
// Http requests in lieu of firebase Cloud Functions
import { HttpClientModule } from '@angular/common/http';
// Firefox complained about not having this
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
// Sorcery
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { CoreRouting } from './core.routing';
// Has router-outlet
import { CoreShellComponent } from './core.shell';

// Firebase App
import { 
  initializeApp, 
  provideFirebaseApp, 
  getApp 
} from '@angular/fire/app';
// Firebase Auth 
import { 
  provideAuth, 
  getAuth, 
  connectAuthEmulator 
} from '@angular/fire/auth';
// Firebase Firestore
import { 
  // initializeFirestore, 
  provideFirestore, 
  getFirestore, 
  connectFirestoreEmulator 
} from '@angular/fire/firestore';
// Firebase Realtime Database
import {
  provideDatabase,
  getDatabase,
  connectDatabaseEmulator
} from '@angular/fire/database';
// Firebase Functions
import {
  provideFunctions,
  getFunctions,
  connectFunctionsEmulator
} from '@angular/fire/functions';
//Firebase Messaging
import {
  provideMessaging,
  getMessaging
} from '@angular/fire/messaging';
// Firebase Storage
import {
  provideStorage,
  getStorage,
  connectStorageEmulator
} from '@angular/fire/storage';
// Firebase Analytics
import {
  provideAnalytics,
  getAnalytics
} from '@angular/fire/analytics';
// import { get } from 'http';
// TODO See if better way exists to hide key
import { API_KEY_TOKEN } from '@properproperty/app/google-maps/util';

import { enableProdMode, isDevMode } from '@angular/core';
if (process.env['NX_ENVIRONMENT'] === 'production') {
  enableProdMode();
}

import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsReduxDevtoolsPluginModule} from '@ngxs/devtools-plugin';
import { AuthState } from '@properproperty/app/auth/data-access'

import { AuthModule } from '@properproperty/app/auth/data-access';
import { UserProfileState, UserProfileModule } from '@properproperty/app/profile/data-access';
import { NotificationsModule, NotificationsState } from '@properproperty/app/notifications/data-access';
import { GoogleMapsModule } from '@properproperty/app/google-maps/data-access';
import { SkynetModule, OPEN_AI_API_KEY_TOKEN } from '@properproperty/app/open-ai/data-access';
import { FooterModule } from '@properproperty/app/footer/feature';
import { EmailActionModule } from '@properproperty/app/email-action-page/feature'

const NX_ENVIRONMENT = process.env['NX_ENVIRONMENT'] || 'development';
const USE_EMULATORS = (JSON.parse(process.env['NX_USE_EMULATORS'] || 'false') as boolean) && isDevMode();
const NX_FIREBASE_CONFIG = {
  apiKey: process.env['NX_FIREBASE_KEY'],
  authDomain: process.env['NX_FIREBASE_AUTH_DOMAIN'],
  databaseURL: process.env['NX_FIREBASE_DATABASE_URL'],
  projectId: process.env['NX_FIREBASE_PROJECT_ID'],
  storageBucket: process.env['NX_FIREBASE_STORAGE_BUCKET'],
  messagingSenderId: process.env['NX_FIREBASE_MESSAGING_SENDER_ID'],
  appId: process.env['NX_FIREBASE_APP_ID'],
  measurementId: process.env['NX_FIREBASE_MEASUREMENT_ID'],
};

if (NX_ENVIRONMENT === 'development') {
  console.log(NX_FIREBASE_CONFIG);
}
@NgModule({
  declarations: [CoreShellComponent],
  imports: [
    HttpClientModule,
    IonicModule.forRoot(),
    BrowserModule,
    CoreRouting,
    provideAuth(() => {
      const auth = getAuth();
      if (USE_EMULATORS) {
        connectAuthEmulator(auth, 'http://localhost:9099');
      }
      return auth;
    }),
    provideAnalytics(() => getAnalytics()),
    provideMessaging(() => getMessaging()),
    provideFirebaseApp(() => initializeApp(NX_FIREBASE_CONFIG)),
    provideFirestore(() => {
      const firestore = getFirestore();
      if (USE_EMULATORS) {
        connectFirestoreEmulator(firestore, 'localhost', 8081);
      }
      return firestore;
    }),
    provideDatabase(() => {
      const database = getDatabase();
      if (USE_EMULATORS) {
        connectDatabaseEmulator(database, 'localhost', 9000);
      }
      return database;
    }),
    provideFunctions(() => {
      const functions = getFunctions(getApp(), "europe-west1");
      if (USE_EMULATORS) {
        connectFunctionsEmulator(functions, 'localhost', 5001);
      }
      return functions;
    }),
    provideStorage(() => {
      const storage = getStorage();
      if (USE_EMULATORS) {
        connectStorageEmulator(storage, 'localhost', 9199);
      }
      return storage;
    }),
    NgxsModule.forRoot([AuthState, UserProfileState, NotificationsState]),
    NgxsLoggerPluginModule.forRoot({
      disabled: NX_ENVIRONMENT === 'production',
    }),
    NgxsReduxDevtoolsPluginModule.forRoot({
      disabled: NX_ENVIRONMENT === 'production',
    }),
    AuthModule,
    UserProfileModule,
    GoogleMapsModule,
    NotificationsModule,
    SkynetModule,
    FooterModule,
    EmailActionModule
  ],
  // exports: [CoreShell],
  // 
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    // TODO See if better way exists to hide key
    { provide: API_KEY_TOKEN, useValue: process.env['NX_GOOGLE_MAPS_KEY'] },
    { provide: OPEN_AI_API_KEY_TOKEN, useValue: process.env['NX_OPEN_AI'] },
  ],
  bootstrap: [CoreShellComponent],
})
export class CoreModule {}

