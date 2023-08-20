import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotifyApprovalChangeCommand } from '@properproperty/api/notifications/util';

@CommandHandler(NotifyApprovalChangeCommand)
export class NotifyApprovalChangeHandler implements ICommandHandler<NotifyApprovalChangeCommand> {
  async execute(command: NotifyApprovalChangeCommand) {
    console.log('NotifyApprovalChangeCommand');
  }
}
