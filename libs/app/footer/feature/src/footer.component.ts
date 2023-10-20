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
    // document.getElementById('helpGuide')?.setAttribute('href', await this.getHelpGuide());

    const helpGuideButton = document.getElementById('helpGuide');

    if(helpGuideButton){
      // Define the click event handler
helpGuideButton.addEventListener('click', async () => {
  const helpGuideUrl = await this.getHelpGuide();

  // Execute the functionality you want when the button is clicked
  // For example, you can redirect to the help guide URL
  window.location.href = helpGuideUrl;
});
    }
  }

  async getHelpGuide(){
    let response = "";
    try{
      response = await getDownloadURL(ref(this.storage, process.env['NX_FIREBASE_STORAGE_BUCKET'] + "/help-guide/help-guide.pdf"));
    }
    catch(error){}
    return response;
  }
}
