import { Component, OnInit } from '@angular/core';
import { AuthService } from '@properproperty/app/auth/data-access';
import { AuthProviderLogin } from '@properproperty/app/auth/util';
import { Router } from '@angular/router'
import { UserProfileService } from '@properproperty/app/profile/data-access';
import { Store } from '@ngxs/store';
import { Login } from '@properproperty/app/auth/util';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(private readonly store: Store, public authService: AuthService, public router: Router, public userService : UserProfileService) {
    this.email = this.password = "";
  }

  email: string;
  password: string;

  async login() {
    // this.authService.emailLogin(this.email, this.password).then(async (res) => {
    //   if(res != null){
    //     await this.userService.loginUser(res.uid);
    //     this.router.navigate(['/home']);
    //   }
    // })
    // .catch((err) => console.log(err.message));
    this.store.dispatch(new Login(this.email, this.password));
  }

  googleLogin(){
    // this.authService.GoogleAuth()
    //   .then((res) => {
    //     if (res !== null)
    //       this.router.navigate(['/home']);
    //   })
    //   .catch((err) => console.log(err));
    this.store.dispatch(new AuthProviderLogin());
  }

  ngOnInit() {
    console.log ("Linter: Lifecycle methods should not be empty");
  }

}
