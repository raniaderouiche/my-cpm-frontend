import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Delivery } from '../models/Delivery';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {

  public host = environment.apiUrl + "delivery/";

  private source = new BehaviorSubject("");
  deliveryType = this.source.asObservable();

  constructor( private http : HttpClient ) { }

  public getDeliverys(): Observable<Delivery[]>{
    return this.http.get<Delivery[]>(this.host);
  }

  public getDeliveryById(id : number): Observable<Delivery>{
    return this.http.get<Delivery>(`${this.host}${id}`);
  }

  public getDeliveryByOrderId(id : number): Observable<Delivery[]>{
    return this.http.get<Delivery[]>(`${this.host}purchase-order/${id}`);
  }

  public getDeliveryByWorkOrderId(id : number): Observable<Delivery[]>{
    return this.http.get<Delivery[]>(`${this.host}work-order/${id}`);
  }


  public saveDelivery(delivery : Delivery):Observable<Delivery>{
    return this.http.post<Delivery>(this.host, delivery);
  }

  public deleteDelivery(id : Number):Observable<Delivery>{
    return this.http.delete<Delivery>(`${this.host}${id}`);
  }

  setDeliveryType(type : any){
    this.source.next(type)
  }
}
