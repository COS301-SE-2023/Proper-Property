import { Injectable } from '@angular/core';
import { State, Selector, Action, StateContext } from '@ngxs/store';
import { Navigate } from '@ngxs/router-plugin';
import { User } from '@angular/fire/auth';
import { AuthService } from './auth.service';
import { Login, SubscribeToAuthState, SetAuthUser, Register, AuthProviderLogin, Logout } from '@properproperty/app/auth/util';
import { SubscribeToUserProfile } from '@properproperty/app/profile/util';
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
        return ctx.dispatch(new SetAuthUser(user));
      })
    );
  }

  @Action(Login)
  async login(ctx: StateContext<AuthStateModel>, { email, password }: Login) {
    const response = await this.authService.emailLogin(email, password)
    // check if login was successful
    if (response && response.email != null) {
      ctx.dispatch(new SetAuthUser(response));
      return ctx.dispatch(new Navigate(['/']));
    }
    // else do something
    return null;
  }

  @Action(Register)
  async register(ctx: StateContext<AuthStateModel>, { email, password }: Register) {
    const response = await this.authService.register(email, password);
    // check if register was successful
    if (response && response.email != null) {
      ctx.dispatch(new SetAuthUser(response));
      return ctx.dispatch(new Navigate(['/']));
    }
    // else do something
    return null;
  }

  @Action(SetAuthUser)
  setAuthUser(ctx: StateContext<AuthStateModel>, { user }: SetAuthUser) {
    ctx.setState({ user: user });
    return ctx.dispatch(new SubscribeToUserProfile(user?.uid));
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

  @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>) {
    ctx.setState({ user: null });
  }
}
