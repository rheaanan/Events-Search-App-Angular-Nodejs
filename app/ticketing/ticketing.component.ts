
import { ConditionalExpr } from '@angular/compiler';
import {  Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { AppServiceService } from '../app-service.service';
import { Iniputinfo } from '../iniputinfo';
import { trigger, transition, animate, style, state } from '@angular/animations';
import {ViewEncapsulation} from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {} from "googlemaps";

@Component({
  selector: 'ticketing',
  templateUrl: './ticketing.component.html',
  styleUrls: ['./ticketing.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('flyInOut', [
    transition('void => *', [
      style({transform: 'translateX(-100%)'}),
      animate(1000)
    ]),

  ])
]

})

export class TicketingComponent implements OnInit, AfterViewInit{
  options = []
  latitude = 0
  longitude = 0
  twitterUrl = ""
  returnedData = []
  returnedEventData = {}
  returnedVenueData = {}
  gotData = false
  gotSpotData = false
  gotEventData_displayed = false
  gotResults = false
  currFavs = []
  currFavsObjArr = []
  visible = true
  error = false
  no_recs = false
  toggle = false

  eventDataObject={}
  gotEventData = false
  gotMapData = false
  gotFavData = false
  loading = false
  special = ['Artist','Buy','Seatmap','Date','Venue']
  special_spot = ['Check','Popularity']
  lat = 51.678418;
  lng = 7.809007;
  currentEvent =""
  currentEventId = ""
  currentSeatmap= ""
  myStorage = window.localStorage
  taking_here = true
  spot_data = {}


  inputInfoModel = new Iniputinfo ('','all','','miles','here','')
  detailsHeadings = [ 'Artist', 'Venue', 'Date','Genres', 'Price', 'Ticket', 'Buy', 'Seatmap']
  venueHeadings = ['Address','City','Phone','Open', 'General', 'Child']
  spotheadings = ['Name','Followers','Popularity','Check']
  detailsHeadings_kv = {'Date':'Time' ,'Artist':'Artist/Team', 'Venue':'Venue', 'Genres':'Category', 'Price':'Price Ranges','Ticket':'Ticket Status','Buy':'Buy Ticket At','Seatmap':'Seat Map'}
  venueHeadings_kv = {'Address':'Address' ,'City': 'City','Phone':'Phone Number' ,'Open':'Open Hourse' , 'General': 'General Rule', 'Child': 'Child Rule' }
  spotheadings_kv = {'Name':'Name','Followers':'Followers','Popularity':'Popularity','Check':'Check At'}
  @ViewChild('location_text') location_text: ElementRef
  @ViewChild('userForm1') userForm: ElementRef
  @ViewChild('map') mapElement: any;
  map: google.maps.Map;

  constructor(private service : AppServiceService) { }
  toggleDiv():void {
    this.toggle = true
    this.gotEventData_displayed = false
    this.gotData = this.gotData? false: true;

    this.toggle = false
  }
  slideme():void {
    this.visible = this.visible? false: true;
  }

  ngOnInit(): void {
    this.getIpInfoFromAPI();
  }
  setSeatMap(event : Event){
    this.currentSeatmap = (event.target as HTMLInputElement).id
    console.log(this.currentSeatmap)

  }
  ngAfterViewInit(): void{
    this.disableTextRegion();
  }
  getIpInfoFromAPI(){
    this.service.getIpInfo().subscribe((response) => {
      var returned_data = response['loc'].split(",")
      this.latitude = returned_data[0]
      this.longitude = returned_data[1]
      console.log('lat long',this.latitude,this.longitude)
    }, (error) => {
      console.log('Error is',error)
    })
  }
  hasProp(o, name) {
    return o.hasOwnProperty(name);
  }

  displayFavs(event: Event): void{
    this.gotEventData_displayed = false
    this.gotData=false
    this.currFavsObjArr = []
    if (this.myStorage.getItem('idString')!=null){
      var arr = JSON.parse(this.myStorage.getItem('idString'))
      console.log("list has",arr.includes(this.currentEventId))
      this.currFavs = JSON.parse(JSON.stringify(arr))

      for (let i = 0; i < this.currFavs.length; i++) {
        this.currFavsObjArr.push(JSON.parse(this.myStorage.getItem(this.currFavs[i])))
      }
      this.gotFavData=true
    }
    else{
      //TBD display error message no records
      this.gotResults = false
      this.no_recs = true
      console.log("no local storage")
    }


  }
  setFav2(event : Event): void{
    event.preventDefault()
    var i =10
    var tempEventDataObject = {}
    tempEventDataObject['Date'] = this.returnedData[i]['Date']
    tempEventDataObject['EventId'] = this.returnedData[i]['EventId']
    tempEventDataObject['EventName'] = this.returnedData[i]['EventName']
    tempEventDataObject['Category'] = this.returnedData[i]['Category']
    tempEventDataObject['Venue'] = this.returnedData[i]['Venue']
    this.myStorage.setItem(this.currentEventId,JSON.stringify(this.eventDataObject))
    console.log('set fav called',this.myStorage.getItem(this.currentEventId))
    console.log('ids as of now',this.myStorage.getItem('idString'))
    if (this.myStorage.getItem('idString')!=null){
      var arr = JSON.parse(this.myStorage.getItem('idString'))
      console.log("list has",arr.includes(this.currentEventId))
      console.log("not of it",!arr.includes(this.currentEventId))
      if (!arr.includes(this.currentEventId)){
        arr.push(this.currentEventId)
      }
      else{
        const index = arr.indexOf(this.currentEventId, 0);
        if (index > -1) {
          arr.splice(index, 1);
          this.myStorage.removeItem(this.currentEventId)
      }

      }

      console.log("list now has",arr.includes(this.currentEventId))
      this.myStorage.setItem('idString',JSON.stringify(arr))
    }
    else{
      var narr = []
      narr.push(this.currentEventId)
      this.myStorage.setItem('idString',JSON.stringify(narr))
    }
    console.log('set fav called',this.myStorage.getItem('idString'))
  }

  getValue(event: Event): void {
    var abc = (event.target as HTMLInputElement).value;
    this.service.callBackend_autoComplete(abc).subscribe((response) => {
      console.log('Response from API is', response['names'])
      this.options = response['names']
    }, (error) => {
      console.log('Error is',error)
    })
  }

  enableTextRegion():void {
    this.taking_here = false
    this.location_text.nativeElement.disabled=false
  }

  disableTextRegion():void {
    this.taking_here = true
    this.location_text.nativeElement.disabled=true
    //also get current location
    this.getIpInfoFromAPI()
  }

  getGeoLocation(event: Event): void{
    var xyz = (event.target as HTMLInputElement).value;
    this.service.callBackend_geoLocation(xyz).subscribe((response) => {
      console.log(response)
      this.latitude = response['latitude']
      this.longitude = response['longitude']
      console.log('lat long',this.latitude,this.longitude)
    },(error) =>{
      console.log("error is",error)

    })
  }


  getEventGeoLocation(xyz): void{
    this.gotMapData = false;
    this.service.getVenueDetails(xyz).subscribe((response) => {
      console.log(response)
      // this.eventLat = response['latitude']
      // this.eventLng = response['longitude']
      // console.log('Event lat long',this.eventLat,this.eventLng)
      this.lat =  parseFloat(response['Lat'])
      this.lng = parseFloat(response['Lng'])
      this.returnedVenueData = response
      this.gotMapData = true

    },(error) =>{
      console.log("error is",error)

    })
  }
  displayResults(event : Event): void{
    this.gotEventData_displayed=false
    event.preventDefault()
    this.gotFavData=false
    this.gotResults = true
    this.gotData = true
  }
  setFav(event : Event):void{
    event.preventDefault()
    this.eventDataObject['Date'] = this.returnedEventData['Date']
    this.eventDataObject['EventId'] = this.currentEventId
    this.eventDataObject['EventName'] = this.currentEvent
    this.eventDataObject['Category'] = this.returnedEventData['Genres']
    this.eventDataObject['Venue'] = this.returnedEventData['Venue']
    this.myStorage.setItem(this.currentEventId,JSON.stringify(this.eventDataObject))
    console.log('set fav called',this.myStorage.getItem(this.currentEventId))
    console.log('ids as of now',this.myStorage.getItem('idString'))
    if (this.myStorage.getItem('idString')!=null){
      var arr = JSON.parse(this.myStorage.getItem('idString'))
      console.log("list has",arr.includes(this.currentEventId))
      console.log("not of it",!arr.includes(this.currentEventId))
      if (!arr.includes(this.currentEventId)){
        arr.push(this.currentEventId)
      }
      else{
        const index = arr.indexOf(this.currentEventId, 0);
        if (index > -1) {
          arr.splice(index, 1);
          this.myStorage.removeItem(this.currentEventId)
      }

      }

      console.log("list now has",arr.includes(this.currentEventId))
      this.myStorage.setItem('idString',JSON.stringify(arr))
    }
    else{
      var narr = []
      narr.push(this.currentEventId)
      this.myStorage.setItem('idString',JSON.stringify(narr))
    }
    console.log('set fav called',this.myStorage.getItem('idString'))
  }

  onSubmit(event: Event){
    this.no_recs = false
    this.loading = true
    this.gotData =false
    event.preventDefault()
    console.log('validate form',this.inputInfoModel)
    //TBD add distance = 10
    this.service.getResults(this.inputInfoModel, this.latitude, this.longitude).subscribe((response) => {
      this.returnedData = response['eventsArr']
      console.log(response)
      console.log(this.returnedData)
      if (this.returnedData.length!=0){
        this.gotResults = true
        this.toggle=false

        this.loading=false

        this.gotData=true
      }
      else{
        this.gotResults = false
        this.gotData =false
        this.no_recs = true
        //TBD handle error message no records
        this.loading=false
      }
      console.log('did i get data', this.gotData)
    }, (error) => {
      console.log('Error is',error)
    })

  }

  displayEventInfo(){
    this.gotEventData_displayed = true

  }
  fetchEventDetails(event: Event){
    this.no_recs = false
    this.gotEventData = false
    event.preventDefault()
    this.currentEvent=(event.target as HTMLElement).innerHTML
    this.currentEventId=(event.target as Element).id
    console.log('validate form',this.inputInfoModel)
    //TBD add distance = 10
    this.service.getEventDetails((event.target as Element).id).subscribe((response) => {
      this.gotEventData = true
      this.gotEventData_displayed = true
      this.returnedEventData = response
      console.log(response)
      console.log(this.returnedEventData['Artist'])
      this.returnedEventData['Artist'] = this.returnedEventData['Artist'].join(' | ')
      this.getEventGeoLocation(this.returnedEventData['Venue'][1]);
      this.twitterUrl = "https://twitter.com/intent/tweet?text= Check out "+this.currentEvent+" located at "+this.returnedEventData['Venue'][0]+"&hashtags=CSCI571EventSearch"
      this.callSpotify()
      console.log('eventdata',this.returnedEventData)




      // if (this.returnedData.length!=0){

      // }
      // else{

      // }
      console.log('did i get data', this.gotData)
    }, (error) => {
      console.log('Error is',error)
    })

  }

  callSpotify(){
      var artist = JSON.stringify(this.returnedEventData['Artist'].split(" | ")[0])
      this.service.getSpotifyDetails(artist).subscribe((response) => {
      this.gotSpotData = true
      this.spot_data=response
      console.log("artiisssst",response)
      // if (this.returnedData.length!=0){

      // }
      // else{

      // }
    }, (error) => {
      console.log('Error is',error)
    })

  }
  hideAll(){
    this.gotData = false
    this.gotSpotData = false
    this.gotEventData_displayed = false
    this.gotResults = false
    this.error = false
    this.no_recs = false
  }

  onClear(event: Event){
    event.preventDefault()
    //this.userForm.reset();
    this.inputInfoModel = new Iniputinfo ('','all','','miles','here','')
    console.log("Clearing Form")




  }


}
