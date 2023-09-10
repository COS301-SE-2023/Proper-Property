import { Injectable } from "@nestjs/common";
import { ICommand, ofType, Saga } from "@nestjs/cqrs";
import { map, Observable } from 'rxjs';
import { ListingEditedEvent, StatusChangedEvent } from "@properproperty/api/listings/util";
import { NotifyApprovalChangeCommand } from "@properproperty/api/notifications/util";
@Injectable()
export class NotificationSagas {
    // TESTING
    @Saga()
    onListingEdited = (events$: Observable<any>): Observable<ICommand> => {
      return events$.pipe(
        ofType(ListingEditedEvent),
        map(
          (event: ListingEditedEvent) => new NotifyApprovalChangeCommand(
            event.listing.user_id, 
            event.listing.listing_id ?? "", 
            false, 
            "Listing has been edited"
          )
        )
      );
    };

    @Saga()
    onListingApproved = (events$: Observable<any>): Observable<ICommand> => {
      return events$.pipe(
        ofType(StatusChangedEvent),
        map(
          (event: StatusChangedEvent) => new NotifyApprovalChangeCommand(
            event.userId, 
            event.listingId, 
            event.change.status, 
            event.change.status ? "Listing has been approved" : "Listing has been rejected"
          )
        )
      );
    };
}