
import { GmapsService } from '@properproperty/app/google-maps/data-access';


export class QualityScoreService {

    constructor(public gmapsService: GmapsService){

    }

    async calculateQualityScore(photos: string[],address:string,price:string,bedrooms:string,bathrooms:string,parking:string,floor_size:string,erf_size:string,pos_type:string,env_type:string,prop_type:string,furnish_type:string,orientation:string): Promise<number>{
            
            let score = 0;

            for(let i = 0; i < this.min(8, photos.length); i++){
                score+= this.calculatePhotoScore(photos[i]);
            }

            if(isNumericInput(price)){
                score+= 5;
            } else score-=20;

            if(isNumericInput(bedrooms)){
                score+= 5;
            } else score-=20;

            if(isNumericInput(bathrooms)){
                score+= 5;
            } else score-=20;

            if(isNumericInput(parking)){
                score+= 5;
            } else score-=20;

            if(isNonEmptyStringInput(floor_size)){
                score+= 5;
            } else score-=15;

            if(isNonEmptyStringInput(erf_size)){
                score+= 5;
            } else score-=15;

            if(isNonEmptyStringInput(pos_type)){
                score+= 5;
            } else score-=15;

            if(isNonEmptyStringInput(env_type)){
                score+= 5;
            } else score-=15;

            if(isNonEmptyStringInput(prop_type)){
                score+= 5;
            } else score-=15;

            if(isNonEmptyStringInput(furnish_type)){
                score+= 5;
            } else score-=15;

            if(isNonEmptyStringInput(orientation)){
                score+= 5;
            } else score-=15;


            const isGeocodable = await this.checkGeocodableAddress(address);

            if (!isGeocodable) {
              return 0;
            }

            return score;
    }

    calculatePhotoScore(photo:string):number{

        let rating = 0;

        getImageDimensions(this.convertBlobUrlToNormalUrl(photo))
        .then(({ width, height }) => {
            rating = 5 * (this.min(width, height) / this.max(width, height));
            return rating;
        })
        .catch((error) => {
            console.error(error.message);
        });

        // getImageDimensions( this.convertBlobUrlToNormalUrl(photo));  

        return -1;
    }

    min(first:number,second:number):number{
        
        const ret = first < second ? first : second;
        return ret;
    }

    max(first:number,second:number){
        return first > second ? first : second;
    }

    convertBlobUrlToNormalUrl(blobUrl: string): string {
        const img = new Image();
        img.src = blobUrl;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Canvas context is not available.");
        }
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(blobUrl); // Revoke the blob URL
        return canvas.toDataURL(); // Convert to a regular data URL
      }

    async checkGeocodableAddress(address: string): Promise<boolean> {
        try {
          const geocoderResult = await this.gmapsService.geocodeAddress(address);
          // If the address is geocodable, the geocoderResult will not be null
          return geocoderResult !== null;
        } catch (error) {
          console.error(error);
          return false;
        }
      }
}  

function getImageDimensions(imageUrl: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageUrl;
  
      image.onload = () => {
        const width = image.naturalWidth;
        const height = image.naturalHeight;
  
        resolve({ width, height });
      };
  
      image.onerror = () => {
        reject(new Error("Failed to load the image."));
      };
    });
  }
  
  function isNumericInput(input: string): boolean {
    // Regular expression to check if the input contains only numeric characters
    const numericRegex = /^[0-9,]+$/;
    return numericRegex.test(input);
  }
  
  function isNonEmptyStringInput(input: string): boolean {
    return input.trim() !== "";
  }

  