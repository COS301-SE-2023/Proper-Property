
import { NotificationsDoc } from "@properproperty/api/notifications/util";
import { 
  SubscribeToNotificationsState,
  UnsubscribeFromNotificationsState
} from '@properproperty/app/notifications/util';
import { State, Selector, Store, StateContext, Action } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { Firestore, doc, onSnapshot, Unsubscribe, getDoc } from "@angular/fire/firestore";

export interface NotificationsStateModel {
  notifications: NotificationsDoc | null;
  snapshotListener: Unsubscribe | null;
}

@State<NotificationsStateModel>({
  name: 'notifications',
  defaults: {
    notifications: null,
    snapshotListener: null
  }
})
@Injectable()
export class NotificationsState {
  constructor(
    private readonly store: Store, 
    private readonly firestore: Firestore) {}

  @Selector()
  static notifications(state: NotificationsStateModel) {
    return state.notifications?.notifications;
  }

  @Selector()
  static notificationsListener(state: NotificationsStateModel) {
    return state.snapshotListener;
  }

  @Action(SubscribeToNotificationsState)
  async subscribeToNotificationsState(ctx: StateContext<NotificationsStateModel>, { userId }: SubscribeToNotificationsState) {
    // Unsubscribe from any previous listener
    let listener = ctx.getState().snapshotListener;
    if (listener) {
      listener();
    }

    // Reset state
    let docData: NotificationsDoc | null = listener = null;
    // If userId is provided, get snapshot listener for user profile document
    if (userId) {
      // Get document reference to new user profile
      const docRef = doc(this.firestore, `notifications/${userId}`);
      // Get Document Data
      docData = (await getDoc(docRef)).data() as NotificationsDoc;
      // Subscribe to document changes
      listener = onSnapshot(
        docRef, 
        (doc) => {
          const notifications = doc.data() as NotificationsDoc;
          ctx.patchState({ notifications: notifications });
        }
      );
      console.log('subscribed to notifications');
    }
    // Update state
    ctx.patchState({ 
      notifications: docData,
      snapshotListener: listener 
    });
  }

  @Action(UnsubscribeFromNotificationsState)
  async unsubscribeFromNotificationsState(ctx: StateContext<NotificationsStateModel>) {
    // Unsubscribe from any previous listener
    const listener = ctx.getState().snapshotListener;
    if (listener) {
      listener();
    }
    // Update state
    ctx.patchState({ notifications: null, snapshotListener: null });
  }
}
