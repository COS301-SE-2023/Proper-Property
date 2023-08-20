import { NotifyStatusChangeCommand } from '../commands';

export class StatusChangeNotifiedEvent {
  constructor(
    public readonly command: NotifyStatusChangeCommand,
  ) {}
}
