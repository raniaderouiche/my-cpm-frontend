import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  public host = environment.apiUrl + "email/";

  constructor(private http : HttpClient) { }

  public sendInvitationEmail(email : string):Observable<HttpResponse<any> | HttpErrorResponse |any>{
    return this.http.post<HttpResponse<any>>(`${this.host}invitation`,email);
  }
}
