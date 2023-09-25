import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotifyViewDropCommand } from '@properproperty/api/notifications/util';

@CommandHandler(NotifyViewDropCommand)
export class NotifyViewDropHandler implements ICommandHandler<NotifyViewDropCommand> {
  async execute(command: NotifyViewDropCommand) {
    console.log(command);
  }
}
