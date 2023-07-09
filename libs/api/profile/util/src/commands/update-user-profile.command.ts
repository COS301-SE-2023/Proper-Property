import { UserProfile } from "@properproperty/api/profile/util";

export class UpdateUserProfileCommand {
  constructor(public readonly user: UserProfile) {}
}