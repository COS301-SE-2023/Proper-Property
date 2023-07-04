import { Injectable } from '@angular/core';
import { State, Selector, Action, StateContext } from '@ngxs/store';
import { Navigate } from '@ngxs/router-plugin';
import { User } from '@angular/fire/auth';
import { AuthService } from './auth.service';
import { Login, SubscribeToAuthState, SetUser, Register, AuthProviderLogin } from '@properproperty/app/auth/util'
import { tap } from 'rxjs';

export interface AuthStateModel {
  user: User | null;
}

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    user: null
  }
})
@Injectable()
export class AuthState {
  constructor(private readonly authService: AuthService) {}

  @Selector()
  static user(state: AuthStateModel) {
    return state.user;
  }

  // Gets an observable of the firebase user's auth state
  // and dispatches an action to set the user in the store
  // whenever the auth state changes.
  // pipe() is used to chain RxJS operators
  // tap() is used to perform side effects (observer pattern)
  @Action(SubscribeToAuthState)
  async subscribeToAuthState(ctx: StateContext<AuthStateModel>) {
    return this.authService.getState$().pipe(
      tap( (user: User | null) => {
        return ctx.dispatch(new SetUser(user)) 
      })
    );
  }

  @Action(Login)
  async login(ctx: StateContext<AuthStateModel>, { email, password }: Login) {
    return this.authService.emailLogin(email, password).then((user: User) => {
      // check if login was successful
      if (user.email != null) {
        return ctx.dispatch(new Navigate(['/']));
      }
      // else do something
      return null;
    });
  }

  @Action(Register)
  async register(ctx: StateContext<AuthStateModel>, { email, password }: Register) {
    return this.authService.register(email, password).then((user: User) => {
      // check if register was successful
      if (user.email != null) {
        return ctx.dispatch(new Navigate(['/']));
      }
      // else do something
      return null;
    });
  }

  @Action(SetUser)
  setUser(ctx: StateContext<AuthStateModel>, { user }: SetUser) {
    ctx.setState({ user: user });
  }

  @Action(AuthProviderLogin)
  async authProviderLogin(ctx: StateContext<AuthStateModel>, { provider }: AuthProviderLogin) {
    let user: User | null = null;
    if (provider == undefined) {
      user = await this.authService.GoogleAuth();
    }
    else {
      user = await this.authService.AuthLogin(provider);
    }
    if (user?.email != null) {
      
      return ctx.dispatch(new Navigate(['/']));
    }
    
    return null;
  }
}
