import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { CreateListingPage } from './create-listing.page';

describe('CreateListingPage', () => {
  let component: CreateListingPage;
  let fixture: ComponentFixture<CreateListingPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(CreateListingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
