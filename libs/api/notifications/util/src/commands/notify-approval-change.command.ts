import { StatusChangedEvent } from '@properproperty/api/listings/util';
export class NotifyApprovalChangeCommand {
  constructor(
    public readonly event: StatusChangedEvent
  ) {}
}