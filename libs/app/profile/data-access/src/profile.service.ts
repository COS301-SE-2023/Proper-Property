import { Injectable } from '@angular/core';
import { GetUserProfileRequest, GetUserProfileResponse, UpdateUserProfileRequest, UpdateUserProfileResponse, UserProfile } from '@properproperty/api/profile/util';
import { characteristics } from '@properproperty/api/listings/util';
import { Interests } from '@properproperty/api/profile/util';
import { Firestore, doc, deleteDoc } from '@angular/fire/firestore';
import { httpsCallable, Functions, HttpsCallableResult } from '@angular/fire/functions';
import { UpdateUserProfile } from '../../util/src/profile.actions';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  currentUser: UserProfile | null = null;

  constructor(private firestore: Firestore, private readonly functions: Functions) {}
  // TODO: Replace with state management
  getCurrentUser() {
    return this.currentUser;
  }

  printCurrentUser() {
    return [this.currentUser?.email, this.currentUser?.firstName, this.currentUser?.lastName, this.currentUser?.userId, this.currentUser?.interests]
  }

  async deleteUser(uid: string) {
    const userRef = doc(this.firestore, `users/${uid}`);
    await deleteDoc(userRef);
  }

  async getUser(uid: string) : Promise<UserProfile>{
    const resp = (await httpsCallable<
      GetUserProfileRequest,
      GetUserProfileResponse
    >(
      this.functions, 
      'getUserProfile'
    )({userId: uid})).data as GetUserProfileResponse;
    console.log(resp);
    return resp.user as UserProfile;
  }

  async updateUserProfile(uProfile: UserProfile) {
    const resp: HttpsCallableResult = await httpsCallable<
      UpdateUserProfileRequest,
      UpdateUserProfileResponse
    >(this.functions, 'updateUserProfile')({user: uProfile});
    console.log(resp);
  }

  vPotency = 0;
  adjustment: Interests= {
    garden: 0,
    party: 0,
    mansion: 0,
    accessible: 0,
    foreign: 0,
    openConcept: 0,
    ecoWarrior: 0,
    family: 0,
    student: 0,
    lovinIt: 0,
    farm: 0,
    Gym: 0,
    owner: 0,
    leftUmbrella: 0
  }

  async updateInterests(characteristic : characteristics, userID: string)
  {
    const profile = this.getUser(userID);
    this.calculatePotency(characteristic);
 
    // garden
    let holder = (await profile).interests.garden;
    this.adjustment.garden = holder + (+!!characteristic.garden)*this.vPotency;
    if(this.adjustment.garden>100)
    {
      this.adjustment.garden=100;
    }
    (await profile).interests.garden = this.adjustment.garden;

    holder = (await profile).interests.owner;
    this.adjustment.owner = holder + (+!!characteristic.garden)*this.vPotency*0.25;
    if(this.adjustment.owner> 100)
    {
      this.adjustment.owner=100;
    }
    (await profile).interests.owner = this.adjustment.owner;

    holder = (await profile).interests.mansion;
    this.adjustment.mansion = holder + (+!!characteristic.garden)*this.vPotency*0.25;
    if(this.adjustment.mansion> 100)
    {
      this.adjustment.mansion=100;
    }
    (await profile).interests.mansion = this.adjustment.mansion;

    holder = (await profile).interests.farm;
    this.adjustment.farm = holder + (+!!characteristic.garden)*this.vPotency*0.25;
    if(this.adjustment.farm> 100)
    {
      this.adjustment.farm=100;
    }
    (await profile).interests.farm = this.adjustment.farm;

    holder = (await profile).interests.ecoWarrior;
    this.adjustment.ecoWarrior = holder + (+!!characteristic.garden)*this.vPotency*0.25;
    if(this.adjustment.ecoWarrior> 100)
    {
      this.adjustment.ecoWarrior=100;
    }
    (await profile).interests.ecoWarrior = this.adjustment.ecoWarrior;


    this.updateUserProfile(await profile);
    
    // party: boolean;
    // mansion: boolean;
    // accessible: boolean;
    // foreign: boolean;
    // openConcept: boolean;
    // ecoWarrior: boolean;
    // family: boolean;
    // student: boolean;
    // lovinIt: boolean;
    // farm: boolean;
    // Gym: boolean;
    // owner: boolean;
    // leftUmbrella: boolean;

    
  }

  calculatePotency(c: characteristics)
  {
    this.vPotency=1;
    if(c.garden)
    {
      this.vPotency++;
    }
    if(c.party)
    {
      this.vPotency++;
    }
    if(c.mansion)
    {
      this.vPotency++;
    }
    if(c.accessible)
    {
      this.vPotency++;
    }
    if(c.foreign)
    {
      this.vPotency++;
    }
    if(c.ecoWarrior)
    {
      this.vPotency++;
    }
    if(c.family)
    {
      this.vPotency++;
    }
    if(c.student)
    {
      this.vPotency++;
    }
    if(c.lovinIt)
    {
      this.vPotency++;
    }
    if(c.farm)
    {
      this.vPotency++;
    }
    if(c.Gym)
    {
      this.vPotency++;
    }
    if(c.owner)
    {
      this.vPotency++;
    }
  }
}

