import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { SubscribeToAuthState } from '@properproperty/app/auth/util';
import { Select } from '@ngxs/store';
import { AuthState } from '@properproperty/app/auth/data-access';
import { Observable } from 'rxjs';
import { User } from 'firebase/auth';
@Component({
  selector: 'proper-property-app',
  templateUrl: './core.shell.html',
  styleUrls: ['./core.shell.scss'],
})
export class CoreShellComponent implements OnInit{
  @Select(AuthState.user) user$!: Observable<User | null>;
  public loggedIn = false;
  constructor(private readonly store: Store) {
    this.loggedIn = this.user$ != null && this.user$ != undefined;

    this.user$.subscribe((user) => {
      this.loggedIn = user != null && user != undefined;
    });
  }
  
  ngOnInit() {
    this.store.dispatch(new SubscribeToAuthState());
  }
}