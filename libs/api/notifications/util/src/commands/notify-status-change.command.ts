export class NotifyStatusChangeCommand {
  constructor(
    public readonly listingId: string,
    public readonly status: string,
  ) {}
}