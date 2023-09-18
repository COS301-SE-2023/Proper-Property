export interface StoredPlaces {
  id: string,
  name: string,
  geometry: {
    lat: number,
    lng: number
  },
  photos: string,
  types: string[]
}