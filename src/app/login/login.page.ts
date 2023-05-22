import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router'

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(public authService: AuthService, public router: Router) {
    this.email = this.password = "";
  }

  email: string;
  password: string;

  login() {
    this.authService.emailLogin(this.email, this.password).then((res) => {
      if(res != null)
        this.router.navigate(['/home']);
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
