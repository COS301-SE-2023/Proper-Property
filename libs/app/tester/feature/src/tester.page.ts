import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthState } from '@properproperty/app/auth/data-access';
import { Select, Store } from '@ngxs/store';
import { User } from 'firebase/auth';
import { Router } from '@angular/router';
import { SetToken } from '@properproperty/app/auth/util';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

@Component({
  selector: 'properproperty-tester-page',
  templateUrl: './tester.page.html',
  styleUrls: ['./tester.page.scss'],
})
export class TesterPageComponent {
  @Select(AuthState.user) user$!: Observable<User | null>;
  @Select(AuthState.oauthToken) token$!: Observable<string | null>;
  user: User | null = null;
  data = {
    oauth_token: "",
  }
  
  constructor(private http: HttpClient, private router: Router, private readonly store: Store){
    this.user$.subscribe((user) => {
      this.user = user;
    });
    this.token$.subscribe((token) => {
      this.data.oauth_token = token ?? "";
    });
    const url = window.location.href;
    if(url.includes("access_token")){
      const token = url.split("access_token=")[1].split("&")[0];
      this.data.oauth_token = token;
      this.store.dispatch(new SetToken(token));
      this.router.navigate(['/tester']);
    }
    else if (!this.data.oauth_token){
      this.doStuff();
    }

    const dataData = {
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
    }

    // DATA API DOCS - https://developers.google.com/analytics/devguides/reporting/data/v1/rest/?apix=true

    const headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', `Bearer ${this.data.oauth_token}`);
    console.log(headers);
    try{
      http.post("https://analyticsdata.googleapis.com/v1beta/properties/377165028:runReport", dataData, {headers: headers})
      .subscribe((response : any) => {
        console.log(response);
        console.log("Number of visits to homepage: " + response.rows[0].metricValues[0].value);
      })
    }
    catch(error){
      console.log(error);
    }
  }
  
  doStuff(){
    const auth_yoo_ar_el = "http://accounts.google.com/o/oauth2/v2/auth?"
    + "scope=https%3A//www.googleapis.com/auth/analytics.readonly&"
    + "include_granted_scopes=true&"
    + "response_type=token&"
    + "state=state_parameter_passthrough_value&"
    + "redirect_uri=http%3A//localhost:8080/tester&"
    + "client_id=" + process.env['NX_GOOGLE_ANALYTICS_ID'];
    
    window.location.href = auth_yoo_ar_el;
  }
}
