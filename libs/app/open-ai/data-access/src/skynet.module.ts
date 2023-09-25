import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpenAIService } from './open-ai.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [OpenAIService]
})
export class SkynetModule {}
