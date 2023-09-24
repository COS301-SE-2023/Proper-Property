import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GenerateListingDescriptionRequest, GenerateListingDescriptionResponse } from '@properproperty/api/listings/util';
import { Axios, AxiosResponse } from 'axios';
import { NestFactory } from '@nestjs/core';
import { ListingsService } from '@properproperty/api/listings/feature';
import { CoreModule } from '../core.module';
interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    text: string;
    index: number;
    logprobs: number;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
export const generateListingDescription = functions.region('europe-west1').https.onCall(
  async (
    request: GenerateListingDescriptionRequest,
  ): Promise<GenerateListingDescriptionResponse> => {
    // // const headers = new HttpHeaders()
    // // .set('Content-Type', 'application/json')
    // // .set('Authorization', `Bearer ` + process.env['OPENAI_API_KEY']);
    // const headers = {
    //   'Content-Type': 'application/json',
    //   'Authorization': `Bearer ` + process.env['OPENAI_API_KEY']
    // };

    // const data = {
    //   model: "text-davinci-003",
    //   prompt: request.description.prompt,
    //   max_tokens: request.description.max_tokens,
    //   temperature: request.description.temperature
    // }

    // let desc = "";
    // // this.http.post<OpenAIResponse>(this.apiUrl, data, {headers : this.headers}).subscribe((response: OpenAIResponse) => {
    // //   desc = response['choices'][0]['text'];
    // //   console.log(desc)
    // //   resolve(desc);
    // // }, error => {
    // //   console.log(error);
    // // });
    // // redo above http call using axios
    // let axios = new Axios({});
    // let apiUrl = 'https://api.openai.com/v1/completions'
    // let response = (await axios.post(apiUrl, data, {headers : headers})).data;
    // desc = response['choices'][0]['text'];
    // console.log(desc)
    // const data2 = {
    //   model: "text-davinci-003",
    //   prompt: "Create a short heading for a listing based on this description of the property: " + desc,
    //   max_tokens: request.head.max_tokens,
    //   temperature: request.head.temperature
    // }

    // let heading = "";
    // // this.http.post<OpenAIResponse>(this.apiUrl, data2, {headers : this.headers}).subscribe((response: OpenAIResponse) => {
    // //   heading = response['choices'][0]['text'];
    // // });

    // // axios = new Axios({});
    // apiUrl = 'https://api.openai.com/v1/completions'
    // response = (await axios.post(apiUrl, data2, {headers : headers})).data;
    // heading = response['choices'][0]['text'];
    const app = await NestFactory.createApplicationContext(CoreModule);
    const listingService = app.get(ListingsService);
    return await listingService.generateListingDescription(request);
  }
);