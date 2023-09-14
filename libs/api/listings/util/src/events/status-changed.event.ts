import { StatusChange } from '../interfaces';
import { ChangeStatusRequest } from '../requests';

export class StatusChangedEvent {
  constructor(
    public readonly listingId: string,
    public readonly change: StatusChange,
    public readonly userId: string,
    public readonly req: ChangeStatusRequest,
    public readonly address: string
  ){}
}