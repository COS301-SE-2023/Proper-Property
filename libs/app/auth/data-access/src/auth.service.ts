// import { Injectable } from '@angular/core';
// import { 
//   Auth, 
//   signInWithPopup, 
//   createUserWithEmailAndPassword, 
//   GoogleAuthProvider 
// } from '@angular/fire/auth';
// @Injectable({
//   providedIn: 'root',
// })
// export class AuthService {
//   constructor(
//     public auth: Auth // Inject Firebase auth service
//   ) {}
//   // Auth logic to run auth providers
//   async AuthLogin() {
//     const provider = new GoogleAuthProvider();
//     return signInWithPopup(this.auth, provider);
//   }

//   async signInWithEmail(email: string, password: string) {
//     return createUserWithEmailAndPassword(this.auth, email, password);
//   }
// }

import { Injectable } from '@angular/core';
import { GoogleAuthProvider } from 'firebase/auth';
import { 
  Auth,
  getAuth, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  createUserWithEmailAndPassword 
} from "@angular/fire/auth";

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private readonly auth: Auth) {}
  // Sign in with Google
  GoogleAuth() {
    return this.AuthLogin(new GoogleAuthProvider());
  }
  // Auth logic to run auth providers
  AuthLogin(provider : any) {
    return signInWithPopup(this.auth, provider)
      .then((result) => {
        console.log('You have been successfully logged in!');
      })
      .catch((error) => {
        console.log(error);
        return null;
      });
  }

  emailLogin(email : any, password : any){
    return signInWithEmailAndPassword(this.auth, email, password).then((userCredential) => {
      return userCredential.user;
    })
    .catch((error : any) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    }); 
  }
  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }
}
