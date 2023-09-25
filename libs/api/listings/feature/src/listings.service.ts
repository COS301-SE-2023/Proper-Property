import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateListingCommand,
  CreateListingRequest,
  CreateListingResponse,
  GetListingsRequest,
  GetListingsResponse,
  GetListingsQuery,
  ChangeStatusRequest,
  ChangeStatusResponse,
  ChangeStatusCommand,
  GetApprovedListingsResponse,
  GetApprovedListingsQuery,
  EditListingRequest,
  EditListingCommand,
  EditListingResponse,
  GetUnapprovedListingsResponse,
  GetUnapprovedListingsQuery,
  SaveListingCommand,
  GetFilteredListingsResponse,
  GetFilteredListingsRequest,
  GetFilteredListingsQuery,
  GenerateListingDescriptionRequest,
  GenerateListingDescriptionResponse
} from '@properproperty/api/listings/util';
import axios, { Axios } from 'axios';
@Injectable()
export class ListingsService {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  async getListings(req: GetListingsRequest): Promise<GetListingsResponse> {
    return this.queryBus.execute(new GetListingsQuery(req));
  }

  async createListing(
    req: CreateListingRequest
  ): Promise<CreateListingResponse> {
    return this.commandBus.execute(new CreateListingCommand(req.listing));
  }

  async changeStatus(req: ChangeStatusRequest): Promise<ChangeStatusResponse>{
    return this.commandBus.execute(new ChangeStatusCommand(req));
  }
  async getApprovedListings(): Promise<GetApprovedListingsResponse>{
    return this.queryBus.execute(new GetApprovedListingsQuery());
  }

  async getUnapprovedListings(): Promise<GetUnapprovedListingsResponse>{
    return this.queryBus.execute(new GetUnapprovedListingsQuery());
  }

  async editListing(req: EditListingRequest): Promise<EditListingResponse>{
    return this.commandBus.execute(new EditListingCommand(req.listing))
  }

  async saveListing(req: CreateListingRequest): Promise<CreateListingResponse>{
    return this.commandBus.execute(new SaveListingCommand(req.listing));
  }

  async filterListings(req: GetFilteredListingsRequest): Promise<GetFilteredListingsResponse>{
    return this.queryBus.execute(new GetFilteredListingsQuery(req))
  }

  async generateListingDescription(req: GenerateListingDescriptionRequest): Promise<GenerateListingDescriptionResponse>{
    // const headers = new HttpHeaders()
    // .set('Content-Type', 'application/json')
    // .set('Authorization', `Bearer ` + process.env['OPENAI_API_KEY']);
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ` + process.env['NX_OPEN_AI']
    };

    const data = {
      model: "text-davinci-003",
      prompt: req.description.prompt,
      max_tokens: req.description.max_tokens,
      temperature: req.description.temperature
    }

    let desc = "";
    // this.http.post<OpenAIResponse>(this.apiUrl, data, {headers : this.headers}).subscribe((response: OpenAIResponse) => {
    //   desc = response['choices'][0]['text'];
    //   console.log(desc)
    //   resolve(desc);
    // }, error => {
    //   console.log(error);
    // });
    // redo above http call using axios
    const client = new Axios({
      transformRequest: axios.defaults.transformRequest,
      transformResponse: axios.defaults.transformResponse
    });
    let apiUrl = 'https://api.openai.com/v1/completions'
    let response = (await axios.post(apiUrl, data, {headers : headers})).data;
    desc = response['choices'][0]['text'];
    console.log(desc)
    const data2 = {
      model: "text-davinci-003",
      prompt: "Create a short heading for a listing based on this description of the property: " + desc,
      max_tokens: req.head.max_tokens,
      temperature: req.head.temperature
    }

    let heading = "";
    // this.http.post<OpenAIResponse>(this.apiUrl, data2, {headers : this.headers}).subscribe((response: OpenAIResponse) => {
    //   heading = response['choices'][0]['text'];
    // });

    // axios = new Axios({});
    apiUrl = 'https://api.openai.com/v1/completions'
    response = (await client.post(apiUrl, data2, {headers : headers})).data;
    heading = response['choices'][0]['text'];

    return {head: heading, description: desc};
  }
}
