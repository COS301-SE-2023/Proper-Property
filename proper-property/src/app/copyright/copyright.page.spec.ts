import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CopyrightPage } from './copyright.page';

describe('CopyrightPage', () => {
  let component: CopyrightPage;
  let fixture: ComponentFixture<CopyrightPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(CopyrightPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
