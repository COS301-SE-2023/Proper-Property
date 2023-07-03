import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-copyright',
  templateUrl: './copyright.page.html',
  styleUrls: ['./copyright.page.scss'],
})
export class CopyrightPage implements OnInit {

  constructor() { }

  ngOnInit() {
    console.log ("Linter: Lifecycle methods should not be empty");
  }

}
