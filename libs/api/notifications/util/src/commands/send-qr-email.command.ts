import { SendQREmailRequest } from "../requests";

export class SendQREmailCommand {
  constructor(public readonly req : SendQREmailRequest ) {}
}