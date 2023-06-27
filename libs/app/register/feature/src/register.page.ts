import { Component, OnInit } from '@angular/core';
import { AuthService } from '@properproperty/app/auth/data-access';
import { Router } from '@angular/router';
import { profile } from '@properproperty/app/profile/util';
import { UserService } from '@properproperty/app/user/data-access';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  constructor(public authService: AuthService, public router: Router, public userService: UserService) {
    this.name = this.surname = this.password = this.email = this.confirm_password = "";
  }

  name:string;
  surname:string;
  password:string;
  email:string;
  confirm_password:string;
  passwordMatch:boolean = true;

  async register() {
    if (this.password !== this.confirm_password) {
      this.passwordMatch = false;
      return; // Prevent further execution
    }
    this.authService.register(this.email, this.password).then(async (res) => {
      if(res !== null){
        let user : profile = {
          email: this.email,
          first_name: this.name,
          last_name: this.surname,
          listings: []
        }
        await this.userService.registerNewUser(user, res.user.uid);
        console.log("Register page: " + this.userService.printCurrentUser());
        this.router.navigate(['/home']);
      }
    });
  }

  checkPassword() {
   
  }

  ngOnInit() {
  }

}
