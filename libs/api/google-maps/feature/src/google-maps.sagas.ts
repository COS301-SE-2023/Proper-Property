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
}