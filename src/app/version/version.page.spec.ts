import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { VersionPage } from './version.page';

describe('VersionPage', () => {
  let component: VersionPage;
  let fixture: ComponentFixture<VersionPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(VersionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
