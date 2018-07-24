import { Component, OnInit } from '@angular/core';
import { DataService } from './data.service';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public title = "FX Calculator";
  public countries;
  public fromCode = {
    code:"",
    symbol:""
  };
  public toCode = {
    code:"",
    symbol:""
  };
  public selected = {
    code:"",
    symbol:""
  };
  public rate;
  public fxRate;
  public send; public receive;
  public fxError = false;
  public flatCountriesList = [];
  public sendErr;
  constructor(private _dataService: DataService) { }

  ngOnInit() {
    this.getCountries();
  }
  //Call a service method to invoke API call to get the Countries List
  getCountries() {
    this._dataService.getCountries().subscribe(
      data => { this.countries = data},
      err => console.error(err),
      () => {
        this.getFlatCountriesList(this.countries);
      }
    );
  }
  //Method to flat the countries list based on currencies.
  getFlatCountriesList(countries){
    for(let i = 0; i < countries.length; i++){
      let country = {};
      if(countries[i].currencies.length > 1){
        for(let j = 0; j < countries[i].currencies.length; j++){
          if(countries[i].currencies[j].code != null && countries[i].currencies[j].code != '(none)'){
            country = {
              name: countries[i].name + ' - ' + countries[i].currencies[j].code,
              currencies: countries[i].currencies[j],
            };
            this.flatCountriesList.push(country);
          }
        }
      }else{
        country = {
          name: countries[i].name,
          currencies: countries[i].currencies[0]
        };
        this.flatCountriesList.push(country);
      }
    }
  }

  //Call a service method to invoke API call to get the FXRates
  getFXRate(){
    if(this.fromCode && this.fromCode.code != "" && this.fromCode.code != null && this.toCode && this.toCode.code != "" && this.toCode.code != null){
      this._dataService.getFXRates(this.fromCode.code, this.toCode.code).subscribe(
        data => {
          this.fxRate = data;
          if(this.fxRate.result == 'error'){
            this.fxError = true;
          }else{
            this.fxError = false;
          }
          this.rate = this.fxRate.rate;
          console.log(data);
        },
        err => console.error(err),
        () => {
          this.convertCurrency(3);
        }
      );
    }
  }
  //Operator: 1 to convert send amount, 2 to convert receive amount & 3 for OnFXRate Change
  convertCurrency(operator){

    //Check if the send, receive and fxRate are number
    if(this.rate && !isNaN(this.rate) && this.rate != null){
      if(operator === 1 && !isNaN(this.send)){
        this.receive = this.send * this.rate;
      }else if(operator === 2 && !isNaN(this.receive)){
        this.send = this.receive / this.rate;
      }else if(operator === 3){
        if(this.send != null && !isNaN(this.send)){
          this.receive = this.send * this.rate;
        }else if(this.receive != null && !isNaN(this.receive)){
          this.send = this.receive / this.rate;
        }
      }
    }
    //Validating Min and Max on send input field.
    if(this.send < 1 && this.send != null){
      this.sendErr = "Minimum amount must be 1";
    }else if(this.send > 5000){
      this.sendErr = "Maximum amount should not be greater than 5000";
    }else{
      this.sendErr = "";
    }

  }

  //Method to compare Option values in Select
  compareFn(a,b) {
    return a && b && a.code === b.code;
  }
}