import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { HomePage } from '@properproperty/app/home/feature';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [IonicModule.forRoot(), RouterModule.forRoot([])]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const mockUserService = jasmine.createSpyObj('UserProfileService', ['getCurrentUser']);
    const mockGmapsService = jasmine.createSpyObj('GmapsService', ['getRegionPredictions']);
    const mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    component = new HomePage(mockUserService, mockGmapsService, mockRouter);
    component.isMobile = false; // Set the mobile flag for testing if needed
    component.searchQuery = ''; // Set an initial search query if needed
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
