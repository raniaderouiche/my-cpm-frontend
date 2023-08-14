import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DefinitiveOrder } from '../models/DefinitiveOrder';

@Injectable({
  providedIn: 'root'
})
export class DefinitiveOrderService {

  public host = environment.apiUrl + "definitiveOrder/";

  constructor( private http : HttpClient ) { }

  public getDefinitiveOrders(): Observable<DefinitiveOrder[]>{
    return this.http.get<DefinitiveOrder[]>(this.host);
  }

  public getDefinitiveOrderById(id : number): Observable<DefinitiveOrder>{
    return this.http.get<DefinitiveOrder>(`${this.host}${id}`);
  }

  public saveDefinitiveOrder(definitiveOrder : DefinitiveOrder,id: number):Observable<DefinitiveOrder>{
    return this.http.post<DefinitiveOrder>(`${this.host}?workOrderID=${id}`, definitiveOrder);
  }

  public deleteDefinitiveOrder(id : Number):Observable<DefinitiveOrder>{
    return this.http.delete<DefinitiveOrder>(`${this.host}${id}`);
  }

  public getDefinitiveOrdersByWorkOrderID(id : number): Observable<DefinitiveOrder[]>{
    return this.http.get<DefinitiveOrder[]>(`${this.host}filter?workorderID=${id}`);
  }

  public editDefinitiveOrder(definitiveOrder : DefinitiveOrder,id: number):Observable<DefinitiveOrder>{
    return this.http.patch<DefinitiveOrder>(`${this.host}${id}`, definitiveOrder);
  }
}
