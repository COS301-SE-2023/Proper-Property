import { Municipality } from "./municipality.interface";

export interface District{
  name: string;
  municipalities: Municipality[];
}