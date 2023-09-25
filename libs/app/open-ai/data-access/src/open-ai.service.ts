import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OPEN_AI_API_KEY_TOKEN } from '.';
import { GenerateListingDescriptionRequest, GenerateListingDescriptionResponse } from '@properproperty/api/listings/util';
import { Functions, httpsCallable } from '@angular/fire/functions';
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
@Injectable({
  providedIn: 'root'
})
export class OpenAIService {
  apiUrl = 'https://api.openai.com/v1/completions';
  headers : HttpHeaders | undefined = undefined;

  constructor(
    private http: HttpClient,
    @Inject(OPEN_AI_API_KEY_TOKEN) private apiKey: string,
    private readonly functions: Functions
  ) {}

  async getHeadingAndDesc(prompt : string){
    // call google cloud function called generateListingDescription
    const response = (await httpsCallable<
      GenerateListingDescriptionRequest, 
      GenerateListingDescriptionResponse
    >(this.functions, 'generateListingDescription')({
      description: {
        prompt: prompt,
        max_tokens: 500,
        temperature: 0.3,
      },
      head: {
        max_tokens: 75,
        temperature: 0.3
      }
    })).data;
    return response
  }
}
