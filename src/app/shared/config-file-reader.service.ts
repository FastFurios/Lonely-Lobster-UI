import { Injectable } from '@angular/core'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Observable, throwError } from "rxjs"

const sysConfigsPath = "http://localhost:8080/"

@Injectable({
  providedIn: 'root'
})
export class ConfigFileReaderService {

  constructor(private http: HttpClient) { }

  public getJsonFile(filename: string): Observable<any> {
    const url = sysConfigsPath + filename
    return this.http.get(url)
  }


}
