import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AppComponent } from '../app.component';

describe('Visit URL', () => {
  it('should visit the specified URL', () => {
    window.location.href = 'http://localhost:8080';
    // Add your assertions or further testing logic here
  });
});
