import { BetaAnalyticsDataClient } from '@google-analytics/data';
import * as fs from 'fs';
import * as functions from 'firebase-functions';
import * as path from 'path';

export interface GetAnalyticsDataRequest {
  listingId: string;
}

export const getAnalyticsData = functions.region("europe-west1").https.onCall(
  async ({listingId} : GetAnalyticsDataRequest) => {
    if(listingId != ""){
      const cred_path = path.join(__dirname, '..', '..', '..', 'victorias-secret-google-credentials', 'homework.json');
      console.log(cred_path);
      process.env['GOOGLE_APPLICATION_CREDENTIALS'] = cred_path;
      const client = new BetaAnalyticsDataClient();
      // get json data from file at cred_path
      const creds = JSON.parse(fs.readFileSync(cred_path, 'utf8'));
        

      const [response] = await client.runReport({
        property: `properties/${creds.propertyID}`,
        dateRanges: [{
          startDate: "30daysAgo",
          endDate: "today"
        }],
        dimensions: [{
          name: "pagePath"
        },
        {
          name: "date"
        }],
        metrics:[{
          name: "screenPageViews"
        }, {
          name: "userEngagementDuration"
        },{
          name: "totalUsers"
        }],
        dimensionFilter: {
          filter: {
            fieldName: "pagePath",
            stringFilter: {
              matchType: "EXACT",
              value: `/listing;list=${listingId}`,
              caseSensitive: true
            }
          }
        }
      });
      // let dates : Date[] = [];
      // let pageViews : number[] = [];

      // let rows: any = response.rows ?? [];
      // for(let i = 0; rows && i < rows.length; i++){
      //   if (rows[i] && rows[i].dimensionValues[1] && rows[i].metricValues[0]) {
      //     let dimensionValue = rows[i].dimensionValues[1].value;
      //     let year : number = Number(dimensionValue.substring(0,4));
      //     let month : number = Number(dimensionValue.substring(4,6));
      //     let day : number = Number(dimensionValue.substring(6,8));

      //     dates[i] = new Date(year, month, day);
      //     console.log(dates[i]);

      //     let metricValue = rows[i].metricValues[0].value;
      //     pageViews[i] = Number(metricValue);
      //   }
      // }

      // let vals : GetAnalyticsDataResponse = {
      //   dates: dates,
      //   pageViews: pageViews
      // }

      console.log(response.rows);
      // TODO return stuff I guess
      return JSON.stringify(response);
    }
    else{
      return null;
    }
  }
);