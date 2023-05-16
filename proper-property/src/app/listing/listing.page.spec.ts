import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListingPage } from './listing.page';

describe('ListingPage', () => {
  let component: ListingPage;
  let fixture: ComponentFixture<ListingPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ListingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
