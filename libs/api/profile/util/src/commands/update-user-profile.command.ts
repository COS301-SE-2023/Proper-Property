import { profile } from "@properproperty/api/profile/util";

export class UpdateUserProfileCommand {
  constructor(public readonly user: profile) {}
}