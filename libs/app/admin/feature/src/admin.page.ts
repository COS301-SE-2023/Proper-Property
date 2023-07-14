import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'properproperty-admin-page',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {

  constructor(){
    console.log("Constructor - Yo");
  }
  
  ngOnInit() {
    console.log("Yo");
  }
}
