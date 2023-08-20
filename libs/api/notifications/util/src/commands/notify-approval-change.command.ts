export class NotifyApprovalChangeCommand {
  constructor(
    public readonly userId: string,
    public readonly listingId: string,
    public readonly status: boolean,
    public readonly reason: string,
  ) {}
}