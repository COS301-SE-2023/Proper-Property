import { profile } from "@properproperty/api/profile/util";
import { State, Selector, Store, StateContext, Action } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { 
  SubscribeToUserProfile, 
  UnsubscribeFromUserProfile, 
  UpdateEmail, 
  // UpdateFirstName, 
  // UpdateLastName, 
  UpdateUserProfile 
} from "@properproperty/app/profile/util";
import { Firestore, doc, onSnapshot, Unsubscribe, getDoc } from "@angular/fire/firestore";

// import { Unsubscribe } from "firebase/firestore";
import { UserProfileService } from './profile.service';
export interface UserProfileStateModel {
  userProfile: profile | null;
  snapshotListener: Unsubscribe | null;
}

@State<UserProfileStateModel>({
  name: 'userProfile',
  defaults: {
    userProfile: null,
    snapshotListener: null
  }
})
@Injectable()
export class UserProfileState {
  constructor(private readonly store: Store, private readonly firestore: Firestore, private readonly userProfileService: UserProfileService) {}

  @Selector()
  static userProfile(state: UserProfileStateModel) {
    return state.userProfile;
  }

  @Selector()
  static userProfileListener(state: UserProfileStateModel) {
    return state.snapshotListener;
  }

  @Action(SubscribeToUserProfile)
  async subscribeToUserProfile(ctx: StateContext<UserProfileStateModel>, { userId }: SubscribeToUserProfile) {
    // Unsubscribe from any previous listener
    let listener = ctx.getState().snapshotListener;
    if (listener) {
      listener();
    }

    // Reset state
    let docData: profile | null = listener = null;
    // If userId is provided, get snapshot listener for user profile document
    if (userId) {
      // Get document reference to new user profile
      const docRef = doc(this.firestore, `users/${userId}`);
      // Get Document Data
      docData = (await getDoc(docRef)).data() as profile;
      // Subscribe to document changes
      listener = onSnapshot(
        docRef, 
        (doc) => {
          const userProfile = doc.data() as profile;
          ctx.patchState({ userProfile: userProfile });
        }
      );
      console.log('subscribed to user profile');
    }
    // Update state
    ctx.patchState({ 
      userProfile: docData,
      snapshotListener: listener 
    });
  }

  @Action(UnsubscribeFromUserProfile)
  async unsubscribeFromUserProfile(ctx: StateContext<UserProfileStateModel>) {
    // Unsubscribe from any previous listener
    const listener = ctx.getState().snapshotListener;
    if (listener) {
      listener();
    }
    // Update state
    ctx.patchState({ userProfile: null, snapshotListener: null });
  }

  @Action(UpdateEmail)
  async updateEmail(ctx: StateContext<UserProfileStateModel>, { email }: UpdateEmail) {
    // Get current user
    const user = ctx.getState().userProfile;
    // If user exists, update email
    if (user) {
      // Update email
      const updatedUser = { ...user, email: email };
      // Update state
      ctx.patchState({ userProfile: updatedUser });

    }
  }

  @Action(UpdateUserProfile)
  async updateUserProfile(ctx: StateContext<UserProfileStateModel>, { userProfile }: UpdateUserProfile) {
    // Get current user
    const user = ctx.getState().userProfile;
    // If user exists, update data
    if (user) {

      // Surprised this works, but it does.
      const updatedUser = { ...user, ...userProfile };
      // Update state
      // ctx.patchState({ userProfile: updatedUser });
      this.userProfileService.updateUserProfile(updatedUser);
    }
  }
}