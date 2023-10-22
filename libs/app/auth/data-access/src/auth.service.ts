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
  authState,
  sendPasswordResetEmail
} from "@angular/fire/auth";
import { UserProfile } from '@properproperty/api/profile/util';
import { ToastController, ToastOptions } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private readonly auth: Auth,
    private readonly toastController : ToastController) {}

  getState$() {
    return authState(this.auth);
  }
  // Sign in with Google
  GoogleAuth() {
    return this.AuthLogin(new GoogleAuthProvider());
  }
  // Auth logic to run auth providers
  async AuthLogin(provider : AuthProvider) {
    const result = await signInWithPopup(this.auth, provider);
    return result.user;
  }

  async emailLogin(email : string, password : string){
    try{
      return await signInWithEmailAndPassword(this.auth, email, password).then((userCredential) => {
        return userCredential.user;
      });
    }
    catch(error : any){
      this.errorHandler(error);
      return null;
    }
  }
  async register(email: string, password: string) {
    try{
      return await createUserWithEmailAndPassword(this.auth, email, password).then((userCredential) => {
        return userCredential.user;
      });
    }
    catch(error : any){
      this.errorHandler(error);
      return null;
    }
  }
  async logout() {
    return this.auth.signOut();
  }

  async forgotPassword(email: string) {
    try {
      const response = await sendPasswordResetEmail(this.auth, email);

      if(window.location.hostname.includes("localhost")) console.warn(response);
      
      const success = {
        message: "Password reset email sent.",
        duration: 3000, // Duration in milliseconds
        color: 'success', // Use 'danger' to display in red
        position: 'bottom'
      } as ToastOptions;
      const toast = await this.toastController.create(success);
      toast.present();

      return response
    } catch (error) {
      this.errorHandler(error);
      return null;
    }
  }

  deleteCurrentUser() {
    const user = this.auth.currentUser;
    if (user) {
      return deleteUser(user)
      .catch((error) => {
        console.log(error);
      });
    }
    return Promise.reject('No user is currently authenticated.'); // Return a rejected promise if no user is found
  }

  async editEmail(newEmail: string) {
    const user = this.auth.currentUser;
    if (user) {
      return await updateEmail(user, newEmail)
      .catch((error) => {
        this.errorHandler(error);
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
  saveProfileData(profile: UserProfile) {
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

  async errorHandler(error: any) {
    const failed = {
      message: "",
      duration: 3000, // Duration in milliseconds
      color: 'danger', // Use 'danger' to display in red
      position: 'bottom'
    } as ToastOptions;
    switch(error.code){
      case "auth/invalid-email":
        failed.message = "Email address is not valid.";
        break;
      case "auth/user-disabled":
        failed.message =  "User is disabled.";
        break;
      case "auth/user-not-found":
        failed.message =  "User not found.";
        break;
      case "auth/wrong-password":
        failed.message = "Password is incorrect.";
        break;
      case "auth/email-already-in-use":
        failed.message = "Email already in use.";
        break;
      case "auth/invalid-password":
        failed.message = "Invlaid password.";
        break;
      case "auth/too-many-requests":
        failed.message = "Too many failed attempts. Try again later or reset your password.";
        break;
      case "auth/missing-password":
        failed.message = "Invlaid password.";
        break;
      
      default:
        failed.message = "Unknown error occurred";
        break;
    }
  
    const toast = await this.toastController.create(failed);
    toast.present();
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