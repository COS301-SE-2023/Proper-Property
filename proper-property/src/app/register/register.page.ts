import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  name:string;
  Surname:string;
  password:string;
  email:string;

  register() {}
  constructor() { 
    this.name = this.Surname = this.password = this.email = "";
  }

  checkPassword() {
   
  }
  ngOnInit() {
  }

}
