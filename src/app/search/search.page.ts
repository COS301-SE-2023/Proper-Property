import { Component, OnInit } from '@angular/core';

interface Property {
  title: string;
  type: string;
  price: number;
  bedrooms: number;
}

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})


export class SearchPage {
  activeTab: string = 'buying';
  searchQuery: string = '';
  selectedPropertyType: string = '';
  selectedMinPrice: number = 0;
  selectedMaxPrice: number = 0;
  selectedBedrooms: number = 0;
  showAdditionalFilters: boolean = false;
  selectedBathrooms: number = 0;
  selectedParking: number = 0;
  selectedFloorSize: number = 0;
  selectedErfSize: number = 0;
  petFriendly: boolean = false;
  garden: boolean = false;
  pool: boolean = false;
  flatlet: boolean = false;
  other: boolean = false;
  retirement: boolean = false;
  repossession: boolean = false;
  onShow: boolean = false;
  securityEstate: boolean = false;
  auction: boolean = false;

  properties: Property[] = [
    { title: 'House 1', type: 'house', price: 100000, bedrooms: 3 },
    { title: 'Apartment 1', type: 'apartment', price: 1500, bedrooms: 2 },
    { title: 'Condo 1', type: 'condo', price: 2000, bedrooms: 1 },
    // Add more properties here
  ];

  get filteredBuyingProperties(): Property[] {
    return this.properties.filter(property =>
      property.type.includes(this.selectedPropertyType) &&
      property.price >= this.selectedMinPrice &&
      property.price <= this.selectedMaxPrice &&
      (this.selectedBedrooms === 0 || property.bedrooms === this.selectedBedrooms) &&
      property.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  get filteredListingProperties(): Property[] {
    // Add your own logic for filtering listing properties
    // based on the selected filters and search query
    return [];
  }

  filterProperties(): void {
    // Update the filtered properties based on the selected filters and search query
    if (this.activeTab === 'buying') {
      this.filteredBuyingProperties;
    } else if (this.activeTab === 'listing') {
      this.filteredListingProperties;
    }
  }

  changeTab(): void {
    // Reset the selected filters and search query when changing tabs
    this.selectedPropertyType = '';
    this.selectedMinPrice = 0;
    this.selectedMaxPrice = 0;
    this.selectedBedrooms = 0;
    this.searchQuery = '';
    this.filterProperties();
  }

  
  toggleAdditionalFilters(): void {
    this.showAdditionalFilters = !this.showAdditionalFilters;
    this.filterProperties();
  }

}
