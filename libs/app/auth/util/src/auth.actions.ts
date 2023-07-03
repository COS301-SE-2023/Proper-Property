import { AuthProvider, User } from '@angular/fire/auth';

export class Login {
  static readonly type = '[Auth] Login';
  constructor(public readonly email: string, public readonly password: string) {}
}

export class Register {
  static readonly type = '[Auth] Register';
  constructor(public readonly email: string, public readonly password: string) {}
}

export class SetUser {
  static readonly type = '[Auth] SetUser';
  constructor(public readonly user: User | null) {}
}

export class Logout {
  static readonly type = '[Auth] Logout';
}

export class SubscribeToAuthState {
  static readonly type = '[Auth] SubscribeToAuthState';
}

export class AuthProviderLogin {
  static readonly type = '[Auth] AuthProviderLogin';
  constructor(public readonly provider?: AuthProvider) {}
}