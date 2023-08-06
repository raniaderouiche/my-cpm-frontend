import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Role } from '../models/Role';
import { User } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public host = environment.apiUrl + "api/";

  constructor( private http : HttpClient ) { }

  public getUsers(): Observable<User[]>{
    return this.http.get<User[]>(this.host + "users/all");
  }

  public getUsersByOrg(): Observable<User[]>{
    return this.http.get<User[]>(this.host + "users/by-org");
  }

  public getUserById(id : number): Observable<User>{
    return this.http.get<User>(`${this.host}users/${id}`);
  }

  public saveUser(user : User):Observable<User>{
    return this.http.post<User>(this.host + "users/create", user);
  }

  public saveUserWithOrg(user : User, orgId : number):Observable<User>{
    return this.http.post<User>(`${this.host}users/save?orgId=${orgId}`, user);
  }

  public getUserByToken(): Observable<User>{
    return this.http.get<User>(`${this.host}user/profile`);
  }

  public saveRole(role : Role):Observable<Role>{
    return this.http.post<Role>(this.host + "role/save", role);
  }

  public deleteUserById(id : number): Observable<User>{
    return this.http.delete<User>(`${this.host}users/${id}`);
  }
}
