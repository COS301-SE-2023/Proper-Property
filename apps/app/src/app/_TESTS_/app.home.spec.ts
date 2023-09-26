import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AppComponent } from '../app.component';
import { HomePage } from '@properproperty/app/home/feature';


describe('Property Search Integration Tests', () => {

  let homePage: HomePage;

  beforeEach(() => {
    // Mock the required dependencies (you might need to mock more dependencies based on your use case)
    const mockUserService = jasmine.createSpyObj('UserProfileService', ['getCurrentUser']);
    const mockGmapsService = jasmine.createSpyObj('GmapsService', ['getRegionPredictions']);
    const mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    homePage = new HomePage(mockUserService, mockGmapsService, mockRouter);
    homePage.isMobile = false; // Set the mobile flag for testing if needed
    homePage.searchQuery = ''; // Set an initial search query if needed
  });

  it('should initialize properly', () => {
    expect(homePage).toBeTruthy();
  });

  it('should handle input change', () => {
    // Mock an event object (you might need to adjust this based on your event structure)
    const mockEvent: any = { target: { value: 'Test query' } };

    homePage.handleInputChange(mockEvent);
    expect(homePage.predictionsLoading).toBe(true);
    // Add more expectations based on your component behavior after input change
  });

});
