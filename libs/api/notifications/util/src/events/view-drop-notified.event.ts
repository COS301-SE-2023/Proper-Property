import { NotifyViewDropCommand } from '../commands';

export class ViewDropNotifiedEvent {
  constructor(
    public readonly command: NotifyViewDropCommand,
  ) {}
}
