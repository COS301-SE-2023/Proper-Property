import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TesterPageComponent } from './tester.page';

describe('TesterPageComponent', () => {
  let component: TesterPageComponent;
  let fixture: ComponentFixture<TesterPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TesterPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TesterPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
