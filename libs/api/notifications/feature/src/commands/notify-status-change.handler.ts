import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotifyStatusChangeCommand } from '@properproperty/api/notifications/util';

@CommandHandler(NotifyStatusChangeCommand)
export class NotifyStatusChangeHandler implements ICommandHandler<NotifyStatusChangeCommand> {
  async execute(command: NotifyStatusChangeCommand) {
    console.log('NotifyStatusChangeCommand:' + command.status);
  }
}
