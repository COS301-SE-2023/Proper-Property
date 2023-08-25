export class NotifyApprovalChangeCommand {
  constructor(
    public readonly userId: string,
    public readonly listingId: string | undefined,
    public readonly status: boolean,
    public readonly reason: string,
  ) {}
}