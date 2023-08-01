import { UserRecord } from 'firebase-admin/auth';

export class CreateProfileCommand {
  constructor(public readonly user: UserRecord) {}
}
