import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http'
import { URLSearchParams } from 'url';
import { HttpParams } from '@angular/common/http'
import { Iniputinfo } from './iniputinfo';

@Injectable({
  providedIn: 'root'
})
export class AppServiceService {


  constructor(private http : HttpClient) { }
  getData() {
    return this.http.get('getData')
  }
  getIpInfo(){
    return this.http.get('https://ipinfo.io/?token=e43d77bd882bf5')
  }

  callBackend_geoLocation(xyz){
    let params = new HttpParams();
    params = params.append('location',xyz)
    return this.http.get('/getLocation', {params: params})
  }

  callBackend_autoComplete(abc){
    let params = new HttpParams();
    params = params.append('keyword',abc)

    return this.http.get('/getAutoComplete', {params: params})
  }
  getResults(inputInfo: Iniputinfo, lat, lng){

    let params = new HttpParams();

    for (var [key, value] of Object.entries(inputInfo)) {
      if (key=="distance"){
        if (value == ""){
          value = "10"
        }

      }
  		console.log(key, value);
  		params = params.append(key,value)
	  }
    params = params.append('lat', lat)
    params = params.append('lng', lng)

    return this.http.get('/getResults',{params: params})

  }

  getEventDetails(id){
    let params = new HttpParams();
    params = params.append('id', id)
    return this.http.get('/getEventDetails',{params: params})

  }
  getVenueDetails(id){
    let params = new HttpParams();
    params = params.append('id', id)
    return this.http.get('/getVenueDetails',{params: params})

  }
  getSpotifyDetails(artist){
    let params = new HttpParams();
    params = params.append('artist', artist)
    return this.http.get('/spotify',{params: params})
  }

}
