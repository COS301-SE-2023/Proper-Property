import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertsPage } from './alerts.page';

describe('AlertsPage', () => {
  let component: AlertsPage;
  let fixture: ComponentFixture<AlertsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AlertsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
