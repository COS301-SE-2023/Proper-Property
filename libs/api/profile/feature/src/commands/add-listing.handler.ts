import { CommandHandler, ICommandHandler, EventPublisher } from "@nestjs/cqrs";
import { ProfileRepository } from "@properproperty/api/profile/data-access";
import { AddListingCommand } from "@properproperty/api/profile/util";
import { UserProfileModel } from "../models";
@CommandHandler(AddListingCommand)
export class AddListingHandler implements ICommandHandler<
AddListingCommand
>{
  constructor(private readonly profileRepo: ProfileRepository, private readonly eventPublisher: EventPublisher){}

  async execute(command: AddListingCommand){
    const userProfile = (await this.profileRepo.getUserProfile(command.userid)).user;
    if (!userProfile) throw new Error("User no existy");
    const profileModel = this.eventPublisher
      .mergeObjectContext(UserProfileModel.createProfile(userProfile));

    const temp = userProfile;
    if (!temp.listings) {
      temp.listings = [];
    }
    temp.listings.push(command.listingId);
    profileModel.updateUserProfile(temp);
    profileModel.commit();

  }
}