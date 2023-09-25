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

      const client = new BetaAnalyticsDataClient({
        keyFilename: cred_path
      });
      // get json data from file at cred_path
      const creds = JSON.parse(fs.readFileSync(cred_path, 'utf8'));
        let response: any = undefined;
      try {
        [response] = await client.runReport({
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
      } catch (error) {
        return error;
      }
      // TODO return stuff I guess
      return JSON.stringify(response);
    }
    else{
      return null;
    }
  }
);