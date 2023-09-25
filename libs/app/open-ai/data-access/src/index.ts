export * from './open-ai.service';
export * from './skynet.module';
import { InjectionToken } from '@angular/core';
export const OPEN_AI_API_KEY_TOKEN = new InjectionToken<string>('OPEN_AI_API_KEY');