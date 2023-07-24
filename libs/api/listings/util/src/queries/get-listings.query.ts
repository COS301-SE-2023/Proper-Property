import { GetListingsRequest } from "../requests";

export class GetListingsQuery {
  constructor(public readonly request: GetListingsRequest) {}
}