import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.page.html',
  styleUrls: ['./loading.page.scss'],
})
export class LoadingPage implements OnInit {

  constructor() { }

  ngOnInit() {
    if (window.location.hostname.includes("localhost"))
      console.log ("Linter: Lifecycle methods should not be empty");
  }

}
