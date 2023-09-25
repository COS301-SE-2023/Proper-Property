import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
  headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer `);

  constructor(private http: HttpClient) {}

  async descriptionCall(prompt : string) : Promise<string>{
    return new Promise<string>((resolve) =>{
      const data = {
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 1000,
        temperature: 0.3
      }

      let desc = "";
      this.http.post<OpenAIResponse>(this.apiUrl, data, {headers : this.headers}).subscribe((response: OpenAIResponse) => {
        desc = response['choices'][0]['text'];
        console.log(desc)
        resolve(desc);
      }, error => {
        console.log(error);
      });
    })
  }

  async headingCall(prompt : string) : Promise<string>{
    return new Promise<string>((resolve) =>{
      const data = {
        model: "text-davinci-003",
        prompt: "Create a short heading for a listing based on this description of the property: " + prompt,
        max_tokens: 50,
        temperature: 0.3
      }

      let desc = "";
      this.http.post<OpenAIResponse>(this.apiUrl, data, {headers : this.headers}).subscribe((response: OpenAIResponse) => {
        desc = response['choices'][0]['text'];
        console.log(desc)
        resolve(desc);
      }, error => {
        console.log(error);
      });
    })
  }
}
