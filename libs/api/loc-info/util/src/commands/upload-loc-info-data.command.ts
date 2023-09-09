import { UploadLocInfoDataRequest } from "../requests";

export class UploadLocInfoDataCommand{
  constructor(public readonly req : UploadLocInfoDataRequest){}
}