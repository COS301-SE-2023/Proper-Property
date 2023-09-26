import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { HomePage } from '@properproperty/app/home/feature';
describe('HomePage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomePage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  it('trying HOME', () => {
    const fixture = TestBed.createComponent(HomePage);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

});


