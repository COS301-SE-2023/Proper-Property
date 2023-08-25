import { StatusChange } from '../interfaces';

export class StatusChangedEvent {
  constructor(
    public readonly listingId: string,
    public readonly change: StatusChange,
    public readonly userId: string
  ){}
}