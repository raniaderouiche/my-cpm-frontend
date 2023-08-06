import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ItemDelivered } from '../models/ItemDelivered';

@Injectable({
  providedIn: 'root'
})
export class ItemDeliveredService {

  public host = environment.apiUrl + "items-delivered/";

  constructor( private http : HttpClient ) { }

  public getItemsDelivered(): Observable<ItemDelivered[]>{
    return this.http.get<ItemDelivered[]>(this.host);
  }

  public getItemDeliveredById(id : number): Observable<ItemDelivered>{
    return this.http.get<ItemDelivered>(`${this.host}${id}`);
  }

  public saveItemDelivered(ItemDelivered : ItemDelivered,deliveryId: number):Observable<ItemDelivered>{
    return this.http.post<ItemDelivered>(`${this.host}?deliveryId=${deliveryId}`, ItemDelivered);
  }

  public deleteItemDelivered(id : Number):Observable<ItemDelivered>{
    return this.http.delete<ItemDelivered>(`${this.host}${id}`);
  }

  public getItemsDeliveredByDeliveryId(id : Number): Observable<ItemDelivered[]>{
    return this.http.get<ItemDelivered[]>(`${this.host}delivery/${id}`);
  }
}
