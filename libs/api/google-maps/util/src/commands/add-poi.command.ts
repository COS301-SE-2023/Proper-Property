import { StatusChangedEvent } from "@properproperty/api/listings/util";
export class AddPOICommand {
  constructor(public readonly event : StatusChangedEvent) {}
}