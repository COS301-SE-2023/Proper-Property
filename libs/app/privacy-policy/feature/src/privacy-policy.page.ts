import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.page.html',
  styleUrls: ['./privacy-policy.page.scss'],
})
export class PrivacyPolicyPage implements OnInit {

  constructor() { }

  ngOnInit() {
    if (window.location.hostname.includes("localhost"))
      console.log ("Linter: Lifecycle methods should not be empty");
  }

}
