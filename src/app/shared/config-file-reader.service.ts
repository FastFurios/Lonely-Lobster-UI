import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from "rxjs"
import { catchError } from "rxjs/operators"
import { Options } from '@angular-slider/ngx-slider';

const sysConfigsPath = "http://localhost:8080/"


@Injectable({
  providedIn: 'root'
})
export class ConfigFileReaderService {

  //private _jsonURL = 'assets/'

  constructor(private http: HttpClient) { 
  }

  public getJsonFile(filename: string): Observable<any> {
    const url = sysConfigsPath + filename
    console.log("ConfigFileReaderService.getJsonFile(): this.http.get(" + url + ")")
    return this.http.get(url)
  }


}
