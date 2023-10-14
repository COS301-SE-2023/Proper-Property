import { Component, OnInit } from '@angular/core';
import { Storage, ref } from "@angular/fire/storage";
import { getDownloadURL } from 'firebase/storage';

@Component({
  selector: 'properproperty-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit{
  constructor(
    private readonly storage: Storage
  ){}
  async ngOnInit(){
    document.getElementById('helpGuide')?.setAttribute('href', await this.getHelpGuide())
  }

  async getHelpGuide(){
    let response = "";
    try{
      response = await getDownloadURL(ref(this.storage, process.env['NX_FIREBASE_STORAGE_BUCKET'] + "/help-guide/help-guide.pdf"));
    }
    catch(error : any){
      console.log(error.message)
    }
    return response;
  }
}
