import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LoginPage } from '@properproperty/app/login/feature';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginPage ],
      imports: [ IonicModule.forRoot() ]  // Add necessary imports
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Add more unit tests for specific functionality of the LoginPage

  it('should have a title', () => {
    const expectedTitle = 'Login Page'; // Adjust this based on your actual page title
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('ion-title').textContent).toContain(expectedTitle);
  });

  // Add more unit tests based on your component behavior

});
