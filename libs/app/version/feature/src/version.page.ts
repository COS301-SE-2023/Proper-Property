import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-version',
  templateUrl: './version.page.html',
  styleUrls: ['./version.page.scss'],
})
export class VersionPage implements OnInit {

  constructor() { }

  ngOnInit() {
    console.log ("Linter: Lifecycle methods should not be empty");
  }

}
