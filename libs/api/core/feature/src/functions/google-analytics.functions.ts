import { BetaAnalyticsDataClient } from '@google-analytics/data';
import * as fs from 'fs';
import * as functions from 'firebase-functions';
import path = require('path');


export const getAnalyticsData = functions.region("europe-west1").https.onCall(
  async () => {
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
      }],
      metrics:[{
        name: "screenPageViews"
      }],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: {
            matchType: "EXACT",
            value: "/home",
            caseSensitive: true
          }
        }
      }
    });

    console.log(response.rows);
    // TODO return stuff I guess
    return;
  }
);