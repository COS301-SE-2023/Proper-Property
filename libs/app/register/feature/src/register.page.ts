import { Component, OnInit } from '@angular/core';
import { AuthService } from '@properproperty/app/auth/data-access';
import { Router } from '@angular/router';
// import { profile } from '@properproperty/api/profile/util';
import { UserService } from '@properproperty/app/profile/data-access';
import { Store } from '@ngxs/store';
import { Register } from '@properproperty/app/auth/util';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  constructor(private readonly store: Store, public authService: AuthService, public router: Router, public userService: UserService) {
    this.name = this.surname = this.password = this.email = this.confirm_password = "";
  }

  name:string;
  surname:string;
  password:string;
  email:string;
  confirm_password:string;
  passwordMatch = true;

  async register() {
    if (this.password !== this.confirm_password) {
      this.passwordMatch = false;
      return; // Prevent further execution
    }
    // this.authService.register(this.email, this.password).then(async (res) => {
    //   if(res !== null){
    //     const user : profile = {
    //       email: this.email,
    //       firstName: this.name,
    //       lastName: this.surname,
    //       listings: []
    //     }
    //     await this.userService.registerNewUser(user, res.user.uid);
    //     console.log("Register page: " + this.userService.printCurrentUser());
    //     this.router.navigate(['/home']);
    //   }
    // });

    this.store.dispatch(new Register(this.email, this.password));
  }

  checkPassword() {
    console.log("44:19  error  Unexpected empty method 'checkPassword'");
  }

  ngOnInit() {
    console.log ("Lifecycle methods should not be empty");
  }

}
