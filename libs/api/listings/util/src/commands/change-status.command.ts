import { ChangeStatusRequest } from "../requests";

export class ChangeStatusCommand {
  constructor(public readonly req : ChangeStatusRequest) {}
}