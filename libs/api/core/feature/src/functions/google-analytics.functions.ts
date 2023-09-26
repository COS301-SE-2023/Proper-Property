import { BetaAnalyticsDataClient } from '@google-analytics/data';
import * as functions from 'firebase-functions';
export interface GetAnalyticsDataRequest {
  listingId: string;
}

export const getAnalyticsData = functions.region("europe-west1").https.onCall(
  async ({listingId} : GetAnalyticsDataRequest) => {
    if(listingId != ""){
      // pass service worker credentials from env to client without path
      const client = new BetaAnalyticsDataClient({
        credentials: {
          client_email: process.env['NX_SERVICE_ACCOUNT_CLIENT_EMAIL'],
          private_key: process.env['NX_SERVICE_ACCOUNT_PRIVATE_KEY'],
        },
      });
      // get json data from file at cred_path
        let response: any = undefined;
      try {
        [response] = await client.runReport({
          property: `properties/${process.env['NX_SERVICE_ACCOUNT_PROPERTY_ID']}`,
          // property: `properties/${creds.propertyID}`,
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