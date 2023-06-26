import { Component, OnInit } from '@angular/core';
import { AuthService } from '@properproperty/app/auth/data-access';
import { Router } from '@angular/router'
import { UserService } from '@properproperty/app/user/data-access';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(public authService: AuthService, public router: Router, public userService : UserService) {
    this.email = this.password = "";
  }

  email: string;
  password: string;

  async login() {
    this.authService.emailLogin(this.email, this.password).then(async (res) => {
      if(res != null){
        await this.userService.loginUser(res.uid);
        this.router.navigate(['/home']);
      }
      
    })
    .catch((err) => console.log());
  }

  googleLogin(){
    this.authService.GoogleAuth()
      .then((res) => {
        if (res !== null)
          this.router.navigate(['/home']);
      })
      .catch((err) => console.log(err));
  }

  ngOnInit() {
  }

}
