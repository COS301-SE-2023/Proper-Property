import { Injectable } from '@angular/core';
import { GetUserProfileRequest,
   GetUserProfileResponse,
   UpdateUserProfileRequest, 
   UpdateUserProfileResponse, 
   UserProfile, 
   Interests } from '@properproperty/api/profile/util';
import { characteristics } from '@properproperty/api/listings/util';
import { Firestore, doc, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { httpsCallable, Functions, HttpsCallableResult } from '@angular/fire/functions';
import { Storage, getDownloadURL, ref, uploadBytes } from "@angular/fire/storage";

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  currentUser: UserProfile | null = null;

  constructor(private firestore: Firestore, private readonly functions: Functions, private storage: Storage) {}
  // TODO: Replace with state management
  getCurrentUser() {
    return this.currentUser;
  }

  printCurrentUser() {
    return [this.currentUser?.email, this.currentUser?.firstName, this.currentUser?.lastName, this.currentUser?.userId, this.currentUser?.interests]
  }

  async deleteUser(uid: string) {
    console.log("Deleting doc")
    const userRef = doc(this.firestore, `users/${uid}`);
    const response = await deleteDoc(userRef);
    console.log(response);
  }

  async getUser(uid: string) : Promise<UserProfile>{
    const resp = (await httpsCallable<
      GetUserProfileRequest,
      GetUserProfileResponse
    >(
      this.functions, 
      'getUserProfile'
    )({userId: uid})).data;
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

  async uploadProfilePic(userID : string, input: string) {
    let photoURL = "";
    const storageRef = ref(this.storage, process.env['NX_FIREBASE_STORAGE_BUCKET'] + "/" + userID + "/profilePic");
    await fetch("" + input).then(res => res.blob())
    .then(async (blob : Blob) => {
      photoURL = await getDownloadURL((await uploadBytes(storageRef, blob)).ref);
    })

    console.log(photoURL)

    // TODO Add this via CQRS
    const userRef = doc(this.firestore, `users/${userID}`);
    await updateDoc(userRef, {profilePicture: photoURL});
    return photoURL;
  }

  vPotency = 0;

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
    gym: 0,
    owner: 0,
    leftUmbrella: 0
  }

  
  async updateInterests(characteristic : characteristics, userID: string)
  {
    const profile = this.getUser(userID);
    console.log("old interests", profile);
    this.calculatePotency(characteristic);

    this.temp.gym=(await profile).interests.gym;
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
    this.temp.garden =this.mainIncrease(this.temp.garden,(+!!characteristic.garden));

    this.temp.owner = this.allyIncrease(this.temp.owner, (+!!characteristic.garden));
    this.temp.mansion = this.allyIncrease(this.temp.mansion, (+!!characteristic.garden));
    this.temp.farm = this.allyIncrease(this.temp.farm, (+!!characteristic.garden));
    this.temp.ecoWarrior = this.allyIncrease(this.temp.ecoWarrior, (+!!characteristic.garden));

    // party
    this.temp.party =this.mainIncrease(this.temp.party,(+!!characteristic.party));

    this.temp.student = this.allyIncrease(this.temp.student, (+!!characteristic.party));
    this.temp.lovinIt = this.allyIncrease(this.temp.lovinIt,(+!!characteristic.party));
    this.temp.foreign = this.allyIncrease(this.temp.foreign, (+!!characteristic.party))

    this.temp.farm = this.decay(this.temp.farm, (+!!characteristic.party));
    this.temp.family = this.decay(this.temp.family, (+!!characteristic.party));

    // mansion
    this.temp.mansion =this.mainIncrease(this.temp.mansion,(+!!characteristic.mansion));

    this.temp.owner = this.allyIncrease(this.temp.owner, (+!!characteristic.mansion));
    this.temp.farm = this.allyIncrease(this.temp.farm,(+!!characteristic.mansion));
    this.temp.garden = this.allyIncrease(this.temp.garden, (+!!characteristic.mansion))

    this.temp.student = this.decay(this.temp.student, (+!!characteristic.mansion));

    //Accessible
    this.temp.accessible =this.mainIncrease(this.temp.accessible,(+!!characteristic.accessible));

    //Foreign
    this.temp.foreign =this.mainIncrease(this.temp.foreign,(+!!characteristic.foreign));

    this.temp.party = this.allyIncrease(this.temp.party, (+!!characteristic.foreign));
    this.temp.lovinIt = this.allyIncrease(this.temp.lovinIt,(+!!characteristic.foreign));

    //Ecowarrior
    this.temp.ecoWarrior =this.mainIncrease(this.temp.ecoWarrior,(+!!characteristic.ecoWarrior));

    //PG 13
    this.temp.family =this.mainIncrease(this.temp.family,(+!!characteristic.family));

    this.temp.party =this.decay(this.temp.party,(+!!characteristic.family));

    //Student
    this.temp.student =this.mainIncrease(this.temp.student,(+!!characteristic.student));

    this.temp.party =this.allyIncrease(this.temp.party,(+!!characteristic.student));
    this.temp.gym =this.allyIncrease(this.temp.gym,(+!!characteristic.student));
    this.temp.party =this.allyIncrease(this.temp.party,(+!!characteristic.student));

    this.temp.farm =this.decay(this.temp.family,(+!!characteristic.student));

    //Food
    this.temp.lovinIt =this.mainIncrease(this.temp.lovinIt,(+!!characteristic.lovinIt));

    this.temp.farm = this.decay(this.temp.farm, (+!!characteristic.lovinIt));

    //gym rats
    this.temp.gym =this.mainIncrease(this.temp.gym,(+!!characteristic.gym));

    this.temp.farm = this.decay(this.temp.farm, (+!!characteristic.gym));

    //Owner
    this.temp.owner =this.mainIncrease(this.temp.owner,(+!!characteristic.owner));

    this.temp.mansion =this.allyIncrease(this.temp.mansion,(+!!characteristic.owner));
    this.temp.garden =this.allyIncrease(this.temp.garden,(+!!characteristic.owner));

    this.temp.student = this.decay(this.temp.student, (+!!characteristic.owner));

    //farm
    this.temp.farm =this.mainIncrease(this.temp.farm,(+!!characteristic.farm));

    this.temp.garden =this.allyIncrease(this.temp.garden,(+!!characteristic.farm));
    this.temp.mansion =this.allyIncrease(this.temp.mansion,(+!!characteristic.farm));

    this.temp.party =this.decay(this.temp.party,(+!!characteristic.farm));
    this.temp.student =this.decay(this.temp.student,(+!!characteristic.farm));
    this.temp.lovinIt =this.decay(this.temp.lovinIt,(+!!characteristic.farm));

    (await profile).interests.gym = this.temp.gym;
    (await profile).interests.accessible = this.temp.accessible;
    (await profile).interests.ecoWarrior = this.temp.ecoWarrior;
    (await profile).interests.family = this.temp.family;
    (await profile).interests.farm = this.temp.farm;
    (await profile).interests.foreign= this.temp.foreign;
    (await profile).interests.garden = this.temp.garden;
    (await profile).interests.lovinIt = this.temp.lovinIt;
    (await profile).interests.mansion = this.temp.mansion;
    (await profile).interests.owner = this.temp.owner;
    (await profile).interests.party = this.temp.party;
    (await profile).interests.student = this.temp.student;
    console.log("new interest1", profile);
    this.updateUserProfile(await profile);
    console.log("new interest2", profile);
  }

  mainIncrease(fixed: number, boolCharacteristic: number)
  {
    let updates = fixed + boolCharacteristic*this.vPotency;
    if(updates>100)
    {
      updates=100;
    }
    console.log("after ", updates);
    return updates;
  }

  allyIncrease(fixed: number, boolCharacteristic: number)
  {
    let ally = fixed + boolCharacteristic*this.vPotency*0.25;
    if(ally> 100)
    {
      ally=100;
    }

    console.log("after ", ally);
    
    return ally;
  }

  decay(fixed: number, boolCharacteristic: number)
  {
    let enemy = fixed + boolCharacteristic*this.vPotency*-0.25;
    if(enemy<0)
    {
      enemy=0;
    }
    console.log("after ", enemy);
    return enemy;
  }

  calculatePotency(c: characteristics)
  {
    let loop: boolean[] = [c.garden, c.party, c.mansion, c.accessible, c.foreign, c.ecoWarrior, c.family, c.student, c.lovinIt, c.farm, c.gym, c.owner];
    this.vPotency=1;

    for(let x=0; x< loop.length; x++)
    {
      if(loop[x])
      {
        this.vPotency++;
      }
    }
  }

  getInterestArray(profile: UserProfile)
  {
    const inter = profile.interests;
    const arr: number[] = [inter.garden, inter.party, inter.mansion, inter.accessible, inter.foreign, inter.ecoWarrior, inter.family, inter.student, inter.lovinIt, inter.farm, inter.gym, inter.owner];
    return arr;
  }
}

