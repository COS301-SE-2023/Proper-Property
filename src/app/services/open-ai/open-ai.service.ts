import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OpenAIService {

  apiUrl = 'https://api.openai.com/v1/completions';
  headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer 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`);

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
      this.http.post(this.apiUrl, data, {headers : this.headers}).subscribe((response: any) => {
        desc = response['choices'][0]['text'];
        console.log(desc)
        resolve(desc);
      }, error => {
        console.log(error);
      });
    })
  }
}
