import { ApprovalChange } from '../interfaces';

export class StatusChangedEvent {
  constructor(
    public readonly listingId: string,
    public readonly change: ApprovalChange,
    public readonly userId: string
  ){}
}