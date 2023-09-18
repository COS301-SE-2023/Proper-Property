import { Injectable } from "@nestjs/common";
import { ICommand, ofType, Saga } from "@nestjs/cqrs";
import { map, Observable } from 'rxjs';
import { StatusChangedEvent } from "@properproperty/api/listings/util";
import { AddPOICommand } from "@properproperty/api/google-maps/util";
@Injectable()
export class GoogleMapsSagas {
    @Saga()
    onStatusChange = (events$: Observable<any>): Observable<ICommand> => {
      return events$.pipe(
        ofType(StatusChangedEvent),
        map(
          (event: StatusChangedEvent) => new AddPOICommand(event)
        )
      );
    };
    
    // @Saga()
    // onNotification = (events$: Observable<any>): Observable<ICommand> => {
    //   return events$.pipe(
    //     ofType(ApprovalChangeNotifiedEvent),
    //     map(
    //       (event: ApprovalChangeNotifiedEvent) => {
    //         console.log("onNotificationSaga firing")
    //         const ev = new StatusChangedEvent(
    //           "fuck this",
    //           {
    //             adminId: "some guy",
    //             status: StatusEnum.DENIED,
    //             date:"0001-01-01"
    //           },
    //           "fuck this also",
    //           {
    //             status: StatusEnum.DENIED,
    //             listingId: "fuck this",
    //           },
    //           "123 eat my ass Street, shittertonville"
    //         )
    //         return new AddPOICommand(ev);
    //       }
    //     )
    //   );
    // };
}