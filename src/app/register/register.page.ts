import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  constructor(public authService: AuthService, public router: Router) {
    this.name = this.surname = this.password = this.email = this.confirm_password = "";
  }

  name:string;
  surname:string;
  password:string;
  email:string;
  confirm_password:string;
  passwordMatch:boolean = true;

  register() {
    if (this.password !== this.confirm_password) {
      this.passwordMatch = false;
      return; // Prevent further execution
    }
    this.authService.register(this.email, this.password).then((res) => {
      if(res !== null){
        this.router.navigate(['/home']);
      }
    });
  }

  checkPassword() {
   
  }

  ngOnInit() {
  }

}
