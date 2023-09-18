import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TermsOfUsePage } from './terms-of-use.page';

describe('TermsOfUsePage', () => {
  let component: TermsOfUsePage;
  let fixture: ComponentFixture<TermsOfUsePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TermsOfUsePage],
    }).compileComponents();

    fixture = TestBed.createComponent(TermsOfUsePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
