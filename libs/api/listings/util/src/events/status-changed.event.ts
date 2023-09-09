import { ApprovalChange } from '../interfaces';
import { ChangeStatusRequest } from '../requests';

export class StatusChangedEvent {
  constructor(
    public readonly listingId: string,
    public readonly change: ApprovalChange,
    public readonly userId: string,
    public readonly req: ChangeStatusRequest
  ){}
}