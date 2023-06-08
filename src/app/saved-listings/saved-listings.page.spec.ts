import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SavedListingsPage } from './saved-listings.page';

describe('SavedListingsPage', () => {
  let component: SavedListingsPage;
  let fixture: ComponentFixture<SavedListingsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SavedListingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
