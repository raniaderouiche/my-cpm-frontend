import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Market } from '../models/Market';

@Injectable({
  providedIn: 'root'
})
export class MarketService {

  public host = environment.apiUrl + "market/";

  market = {}
  private source = new BehaviorSubject(this.market);
  marketUnit = this.source.asObservable();

  constructor( private http : HttpClient ) { }

  public getMarkets(): Observable<Market[]>{
    return this.http.get<Market[]>(this.host);
  }

  public getMarketById(id : number): Observable<Market>{
    return this.http.get<Market>(`${this.host}${id}`);
  }

  public getMarketsByType(type : String): Observable<Market[]>{
    return this.http.get<Market[]>(`${this.host}type/${type}`);
  }

  public saveMarket(market : Market):Observable<Market>{
    return this.http.post<Market>(this.host, market);
  }

  public deleteMarket(id : Number):Observable<Market>{
    return this.http.delete<Market>(`${this.host}${id}`);
  }

  setMarketUnit(market : any){
    this.source.next(market)
  }

  public getMarketByPurchaseOrderId(id : number): Observable<Market>{
    return this.http.get<Market>(`${this.host}purchase-order/${id}`);
  }

  public getMarketByWorkOrderId(id : number): Observable<Market>{
    return this.http.get<Market>(`${this.host}work-order/${id}`);
  }
}
