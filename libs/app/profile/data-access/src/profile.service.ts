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

  temp: Interests={
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

    this.temp.Gym=(await profile).interests.Gym;
    this.temp.garden =(await profile).interests.garden;
    this.temp.accessible=(await profile).interests.accessible;
    this.temp.party =(await profile).interests.party;
    this.temp.ecoWarrior=(await profile).interests.ecoWarrior;
    this.temp.mansion =(await profile).interests.mansion;
    this.temp.foreign=(await profile).interests.foreign;
    this.temp.family=(await profile).interests.family;
    this.temp.student=(await profile).interests.student;
    this.temp.lovinIt=(await profile).interests.lovinIt;
    this.temp.farm =(await profile).interests.farm;
    this.temp.owner=(await profile).interests.owner;

    // garden
    this.adjustment.garden +=this.mainIncrease(this.temp.garden,(+!!characteristic.garden));

    this.adjustment.owner += this.allyIncrease(this.temp.owner, (+!!characteristic.garden));
    this.adjustment.mansion += this.allyIncrease(this.temp.mansion, (+!!characteristic.garden));
    this.adjustment.farm += this.allyIncrease(this.temp.farm, (+!!characteristic.garden));
    this.adjustment.ecoWarrior += this.allyIncrease(this.temp.ecoWarrior, (+!!characteristic.garden));

    // party
    this.adjustment.party +=this.mainIncrease(this.temp.party,(+!!characteristic.party));

    this.adjustment.student += this.allyIncrease(this.temp.student, (+!!characteristic.party));
    this.adjustment.lovinIt += this.allyIncrease(this.temp.lovinIt,(+!!characteristic.party));
    this.adjustment.foreign += this.allyIncrease(this.temp.foreign, (+!!characteristic.party))

    this.adjustment.farm += this.decay(this.temp.farm, (+!!characteristic.party));
    this.adjustment.family += this.decay(this.temp.family, (+!!characteristic.party));

    // mansion
    this.adjustment.mansion +=this.mainIncrease(this.temp.mansion,(+!!characteristic.mansion));

    this.adjustment.owner += this.allyIncrease(this.temp.owner, (+!!characteristic.mansion));
    this.adjustment.farm += this.allyIncrease(this.temp.farm,(+!!characteristic.mansion));
    this.adjustment.garden += this.allyIncrease(this.temp.garden, (+!!characteristic.mansion))

    this.adjustment.student += this.decay(this.temp.student, (+!!characteristic.mansion));

    //Accessible
    this.adjustment.accessible +=this.mainIncrease(this.temp.accessible,(+!!characteristic.accessible));

    //Foreign
    this.adjustment.foreign +=this.mainIncrease(this.temp.foreign,(+!!characteristic.foreign));

    this.adjustment.party += this.allyIncrease(this.temp.party, (+!!characteristic.foreign));
    this.adjustment.lovinIt += this.allyIncrease(this.temp.lovinIt,(+!!characteristic.foreign));

    //Ecowarrior
    this.adjustment.ecoWarrior +=this.mainIncrease(this.temp.ecoWarrior,(+!!characteristic.ecoWarrior));

    //PG 13
    this.adjustment.family +=this.mainIncrease(this.temp.family,(+!!characteristic.family));

    this.adjustment.party +=this.decay(this.temp.party,(+!!characteristic.family));

    //Student
    this.adjustment.student +=this.mainIncrease(this.temp.student,(+!!characteristic.student));

    this.adjustment.party +=this.allyIncrease(this.temp.party,(+!!characteristic.student));
    this.adjustment.Gym +=this.allyIncrease(this.temp.Gym,(+!!characteristic.student));
    this.adjustment.party +=this.allyIncrease(this.temp.party,(+!!characteristic.student));

    this.adjustment.farm +=this.decay(this.temp.family,(+!!characteristic.student));

    //Food
    this.adjustment.lovinIt +=this.mainIncrease(this.temp.lovinIt,(+!!characteristic.lovinIt));

    this.adjustment.farm += this.decay(this.temp.farm, (+!!characteristic.lovinIt));

    //Gym rats
    this.adjustment.Gym +=this.mainIncrease(this.temp.Gym,(+!!characteristic.Gym));

    this.adjustment.farm += this.decay(this.temp.farm, (+!!characteristic.Gym));

    //Owner
    this.adjustment.owner +=this.mainIncrease(this.temp.owner,(+!!characteristic.owner));

    this.adjustment.mansion +=this.allyIncrease(this.temp.mansion,(+!!characteristic.owner));
    this.adjustment.garden +=this.allyIncrease(this.temp.garden,(+!!characteristic.owner));

    this.adjustment.student += this.decay(this.temp.student, (+!!characteristic.owner));

    //farm
    this.adjustment.farm +=this.mainIncrease(this.temp.farm,(+!!characteristic.farm));

    this.adjustment.garden +=this.allyIncrease(this.temp.garden,(+!!characteristic.farm));
    this.adjustment.mansion +=this.allyIncrease(this.temp.mansion,(+!!characteristic.farm));

    this.adjustment.party +=this.decay(this.temp.party,(+!!characteristic.farm));
    this.adjustment.student +=this.decay(this.temp.student,(+!!characteristic.farm));
    this.adjustment.lovinIt +=this.decay(this.temp.lovinIt,(+!!characteristic.farm));

    (await profile).interests.Gym = this.adjustment.Gym;
    (await profile).interests.accessible = this.adjustment.accessible;
    (await profile).interests.ecoWarrior = this.adjustment.ecoWarrior;
    (await profile).interests.family = this.adjustment.family;
    (await profile).interests.farm = this.adjustment.farm;
    (await profile).interests.foreign= this.adjustment.foreign;
    (await profile).interests.garden = this.adjustment.garden;
    (await profile).interests.lovinIt = this.adjustment.lovinIt;
    (await profile).interests.mansion = this.adjustment.mansion;
    (await profile).interests.owner = this.adjustment.owner;
    (await profile).interests.party = this.adjustment.party;
    (await profile).interests.student = this.adjustment.student;

    this.updateUserProfile(await profile);
  }

  mainIncrease(fixed: number, boolCharacteristic: number)
  {
    let updates = fixed + boolCharacteristic*this.vPotency;
    if(updates>100)
    {
      updates=100;
    }

    return updates;
  }

  allyIncrease(fixed: number, boolCharacteristic: number)
  {
    let ally = fixed + boolCharacteristic*this.vPotency*0.25;
    if(ally> 100)
    {
      ally=100;
    }
    
    return ally;
  }

  decay(fixed: number, boolCharacteristic: number)
  {
    let enemy = fixed + boolCharacteristic*this.vPotency*-0.25;
    if(enemy<0)
    {
      enemy=0;
    }
    
    return enemy;
  }

  calculatePotency(c: characteristics)
  {
    let loop: boolean[] = [c.garden, c.party, c.mansion, c.accessible, c.foreign, c.ecoWarrior, c.family, c.student, c.lovinIt, c.farm, c.Gym, c.owner];
    this.vPotency=1;

    for(let x=0; x< loop.length; x++)
    {
      if(loop[x])
      {
        this.vPotency++;
      }
    }
  }
}

