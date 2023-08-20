import { NotifyApprovalChangeCommand } from '../commands';

export class ApprovalChangeNotifiedEvent {
  constructor(
    public readonly command: NotifyApprovalChangeCommand
  ) {}
}
