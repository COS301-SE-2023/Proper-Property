import { Injectable } from "@nestjs/common";
import { ICommand, ofType, Saga } from "@nestjs/cqrs";
import { map, Observable } from 'rxjs';
import { ListingCreatedEvent, ListingEditedEvent, StatusChangedEvent, StatusEnum } from "@properproperty/api/listings/util";
import { NotifyApprovalChangeCommand, NotifyListingCreatedCommand, NotifyListingEditedCommand } from "@properproperty/api/notifications/util";
@Injectable()
export class NotificationSagas {
    // TESTING
    @Saga()
    onListingEdited = (events$: Observable<any>): Observable<ICommand> => {
      return events$.pipe(
        ofType(ListingEditedEvent),
        map(
          (event: ListingEditedEvent) => {
            if (event.listing.status == StatusEnum.EDITED){
              return new NotifyListingEditedCommand(event);
            }
            return new NotifyListingCreatedCommand(event);
          })
        );
    };

    @Saga()
    onListingCreated = (events$: Observable<any>): Observable<ICommand> => {
      return events$.pipe(
        ofType(ListingCreatedEvent),
        map(
          (event: ListingCreatedEvent) => new NotifyListingCreatedCommand(event)
        )
      );
    };

    @Saga()
    onStatusChange = (events$: Observable<any>): Observable<ICommand> => {
      return events$.pipe(
        ofType(StatusChangedEvent),
        map(
          (event: StatusChangedEvent) => new NotifyApprovalChangeCommand(event)
        )
      );
    };
}