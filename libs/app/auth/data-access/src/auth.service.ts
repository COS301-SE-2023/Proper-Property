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
import { GoogleAuthProvider, AuthProvider } from 'firebase/auth';
import { 
  Auth,
  // getAuth, // 30:3   warning  'getAuth' is defined but never used
  signInWithEmailAndPassword, 
  signInWithPopup, 
  createUserWithEmailAndPassword,
  deleteUser,
  updateEmail,
  authState
} from "@angular/fire/auth";
import { profile } from '@properproperty/api/profile/util';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private readonly auth: Auth) {}

  getState$() {
    return authState(this.auth);
  }
  // Sign in with Google
  GoogleAuth() {
    return this.AuthLogin(new GoogleAuthProvider());
  }
  // Auth logic to run auth providers
  AuthLogin(provider : AuthProvider) {
    return signInWithPopup(this.auth, provider)
      .then((result) => {
        return result.user;
      })
      // .catch((error) => {
      //   console.log(error);
      //   return null;
      // });
  }

  async emailLogin(email : string, password : string){
    return signInWithEmailAndPassword(this.auth, email, password).then((userCredential) => {
      return userCredential.user;
    });
    // .catch((error : any) => {
    //   const errorCode = error.code; // 64:13  warning  'errorCode' is assigned a value but never used
    //   const errorMessage = error.message; // 65:13  warning  'errorMessage' is assigned a value but never used
    // }); 
  }
  async register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password).then((userCredential) => {
      return userCredential.user;
      });
  }

  deleteCurrentUser() {
    const user = this.auth.currentUser;
    if (user) {
      return deleteUser(user)
        .then(() => {
          console.log('User deleted successfully!');
        })
        .catch((error) => {
          console.log(error);
        });
    }
    return Promise.reject('No user is currently authenticated.'); // Return a rejected promise if no user is found
  }

  editEmail(newEmail: string) {
    const user = this.auth.currentUser;
    if (user) {
      return updateEmail(user, newEmail)
        .then(() => {
          console.log('Email updated successfully!');
        })
        .catch((error) => {
          console.log(error);
        });
    }
    return Promise.reject('No user is currently authenticated.'); // Return a rejected promise if no user is found
  }

  private readonly AUTH_COOKIE_NAME = 'authToken';
  private readonly PROFILE_COOKIE_NAME = 'profileData';


  // Save authentication token in a cookie
  saveAuthToken(token: string) {
    setCookie(this.AUTH_COOKIE_NAME, token, 7); // Set the cookie to expire in 7 days
  }

  // Get authentication token from the cookie
  getAuthToken() {
    return getCookie(this.AUTH_COOKIE_NAME);
  }

  // Save profile data in a cookie
  saveProfileData(profile: profile) {
    setCookie(this.PROFILE_COOKIE_NAME, JSON.stringify(profile), 7); // Set the cookie to expire in 7 days
  }

  // Get profile data from the cookie
  getProfileData() {
    const profileCookie = getCookie(this.PROFILE_COOKIE_NAME);
    return profileCookie ? JSON.parse(profileCookie) : null;
  }

  // Clear the authentication and profile cookies
  clearCookies() {
    document.cookie = this.AUTH_COOKIE_NAME + "=; expires=Thu, 01 Jan 2025 00:00:00 UTC; path=/;";
    document.cookie = this.PROFILE_COOKIE_NAME + "=; expires=Thu, 01 Jan 2025 00:00:00 UTC; path=/;";
  }
  
}

function getCookie(name: string) {
  const cookieName = name + "=";
  const cookieArray = document.cookie.split(';');
  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(cookieName) === 0) {
      return decodeURIComponent(cookie.substring(cookieName.length));
    }
  }
  return "";
}

function setCookie(name: string, value: string, days: number) {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + days);
  const cookieValue = encodeURIComponent(value) + "; expires=" + expirationDate.toUTCString() + "; path=/";
  document.cookie = name + "=" + cookieValue;
}
