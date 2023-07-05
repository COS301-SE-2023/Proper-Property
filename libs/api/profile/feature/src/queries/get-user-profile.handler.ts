import { GetUserProfileQuery } from '@properproperty/api/profile/util';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ProfileRepository } from '@properproperty/api/profile/data-access';

@QueryHandler(GetUserProfileQuery)
export class GetUserProfileHandler implements IQueryHandler<GetUserProfileQuery> {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async execute(query: GetUserProfileQuery) {
    return this.profileRepository.getUserProfile(query.userId);
  }
}