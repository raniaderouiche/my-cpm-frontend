import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Attachment } from '../models/Attachment';

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {

  public host = environment.apiUrl + "attachment/";

  private source = new BehaviorSubject("");
  attachmentType = this.source.asObservable();

  constructor( private http : HttpClient ) { }

  public getAttachments(): Observable<Attachment[]>{
    return this.http.get<Attachment[]>(this.host);
  }

  public getAttachmentById(id : number): Observable<Attachment>{
    return this.http.get<Attachment>(`${this.host}${id}`);
  }

  public getAttachmentByOrderId(id : number): Observable<Attachment[]>{
    return this.http.get<Attachment[]>(`${this.host}order/${id}`);
  }

  public getAttachmentByWorkOrderId(id : number): Observable<Attachment[]>{
    return this.http.get<Attachment[]>(`${this.host}work-order/${id}`);
  }


  public saveAttachment(attachment : Attachment):Observable<Attachment>{
    return this.http.post<Attachment>(this.host, attachment);
  }

  public deleteAttachment(id : Number):Observable<Attachment>{
    return this.http.delete<Attachment>(`${this.host}${id}`);
  }

  setAttachmentType(type : any){
    this.source.next(type)
  }
}
