import { AggregateRoot } from '@nestjs/cqrs';
import { ListingEditedEvent, Listing, StatusChange, StatusChangedEvent, ChangeStatusResponse } from '@properproperty/api/listings/util';

export class ListingModel extends AggregateRoot implements Listing {
  constructor(
    public user_id: string | undefined,
    public address: string,
    public price: string,
    public pos_type: string,
    public env_type: string,
    public prop_type: string,
    public furnish_type: string,
    public orientation: string,
    public floor_size: string,
    public property_size: string,
    public bath: string,
    public bed: string,
    public parking: string,
    public features: string[],
    public photos: string[],
    public desc: string,
    public let_sell: string,
    public heading: string,
    public approved: boolean,
    public listingDate: string,
    public listing_id?: string,
    public statusChanges?: StatusChange[],
    public quality_rating?: number,
  ) {
    super();
  }

  static createListing(listing: Listing) {
    const model = new ListingModel(
      listing.user_id,
      listing.address,
      listing.price,
      listing.pos_type,
      listing.env_type,
      listing.prop_type,
      listing.furnish_type,
      listing.orientation,
      listing.floor_size,
      listing.property_size,
      listing.bath,
      listing.bed,
      listing.parking,
      listing.features,
      listing.photos,
      listing.desc,
      listing.let_sell,
      listing.heading,
      listing.approved,
      listing.listingDate,
      listing.listing_id,
      listing.statusChanges,
      listing.quality_rating,
    );
    return model;
  }

  editListing(listing: Listing) {
    this.user_id = listing.user_id;
    this.address = listing.address;
    this.price = listing.price;
    this.pos_type = listing.pos_type;
    this.env_type = listing.env_type;
    this.prop_type = listing.prop_type;
    this.furnish_type = listing.furnish_type;
    this.orientation = listing.orientation;
    this.floor_size = listing.floor_size;
    this.property_size = listing.property_size;
    this.bath = listing.bath;
    this.bed = listing.bed;
    this.parking = listing.parking;
    this.features = listing.features;
    this.photos = listing.photos;
    this.desc = listing.desc;
    this.let_sell = listing.let_sell;
    this.heading = listing.heading;
    this.approved = listing.approved;
    this.listingDate = listing.listingDate;
    this.listing_id = listing.listing_id;
    this.statusChanges = listing.statusChanges;
    this.quality_rating = listing.quality_rating;

    this.apply(new ListingEditedEvent(listing));
  }

  approve(adminId: string): ChangeStatusResponse {
    const change: StatusChange = {
      adminId: adminId,
      status: true,
      date: new Date().toISOString(),
    };
    this.approved = true;
    this.statusChanges = this.statusChanges ?? [];
    this.statusChanges.push(change);
    if (!this.listing_id) {
      throw new Error('yeah idk fam. this should never happen. the listing has no listing_id');
    }
    this.apply(new StatusChangedEvent(this.listing_id, change));

    return {success: true, statusChange: change};
  }

  toJSON(): Listing {
    return {
      user_id: this.user_id,
      address: this.address,
      price: this.price,
      pos_type: this.pos_type,
      env_type: this.env_type,
      prop_type: this.prop_type,
      furnish_type: this.furnish_type,
      orientation: this.orientation,
      floor_size: this.floor_size,
      property_size: this.property_size,
      bath: this.bath,
      bed: this.bed,
      parking: this.parking,
      features: this.features,
      photos: this.photos,
      desc: this.desc,
      let_sell: this.let_sell,
      heading: this.heading,
      approved: this.approved,
      listingDate: this.listingDate,
      listing_id: this.listing_id,
      statusChanges: this.statusChanges,
      quality_rating: this.quality_rating,
    };
  }
}