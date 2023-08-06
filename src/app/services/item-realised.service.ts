import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ItemRealised } from '../models/ItemRealised';

@Injectable({
  providedIn: 'root'
})
export class ItemRealisedService {

  public host = environment.apiUrl + "itemRealised/";

  constructor( private http : HttpClient ) { }

  public getItemsRealised(): Observable<ItemRealised[]>{
    return this.http.get<ItemRealised[]>(this.host);
  }

  public getItemRealisedById(id : number): Observable<ItemRealised>{
    return this.http.get<ItemRealised>(`${this.host}${id}`);
  }

  public saveItemRealised(itemRealised : ItemRealised,attachmentId: number):Observable<ItemRealised>{
    return this.http.post<ItemRealised>(`${this.host}?attachmentId=${attachmentId}`, itemRealised);
  }

  public editItemRealised(itemRealised : ItemRealised,attachmentId: number):Observable<ItemRealised>{
    return this.http.patch<ItemRealised>(`${this.host}?attachmentId=${attachmentId}`, itemRealised);
  }

  public deleteItemRealised(id : Number):Observable<ItemRealised>{
    return this.http.delete<ItemRealised>(`${this.host}${id}`);
  }

  public getItemsRealisedByAttachmentId(id : Number): Observable<ItemRealised[]>{
    return this.http.get<ItemRealised[]>(`${this.host}attachment/${id}`);
  }
}
