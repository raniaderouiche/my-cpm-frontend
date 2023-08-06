import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/User';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  providers: [MessageService],
  styles: [`
        :host ::ng-deep .pi-eye,
        :host ::ng-deep .pi-eye-slash {
            transform:scale(1.6);
            margin-right: 1rem;
            color: var(--primary-color) !important;
        }
    `]
})
export class LoginComponent implements OnInit, OnDestroy {

  items: MenuItem[];

  subscriptions: Subscription[] = [];

  username: String;
  password: String;

  showLoading : boolean;

  user : User;

  badCred : String;
  sessionExp : String;

  loading = false;

  constructor(private authenticationService: AuthenticationService,
    private messageService: MessageService,
    private router: Router) { }

  ngOnInit(): void {

    if(this.authenticationService.isLoggedIn()){
      this.router.navigateByUrl('/dashboard');
    }else{
      //just to be safe
      this.router.navigateByUrl('/login');
    }

    this.showLoading = false;


    this.items = [
      {label: 'Inscription Admin MyCPM', routerLink: ['/registerAdmin']},
      {label: 'Inscription Employée', routerLink: ['/registerEmployee']},
    ];
  }

  ngOnDestroy(): void {
    for(let i = 0; i < this.subscriptions.length; i++){
      if (this.subscriptions[i]) {
        this.subscriptions[i].unsubscribe();
      }
    }
  }

  onSubmit() {
    console.log("hi");

    console.log(this.username);
    console.log(this.password);
    this.loading = true;

    this.user = {
      'username': this.username,
      'password': this.password,
    }

    this.subscriptions.push(


      this.authenticationService.login(this.user).subscribe({
        next: (response: any) => {
          const token = response.body["access_token"];
          this.authenticationService.saveToken(token);
          const refreshtoken = response.body["refresh_token"];
          this.authenticationService.saveRefreshToken(refreshtoken);
          this.authenticationService.addUserRoleToLocalCache()
          this.authenticationService.expiredMsg = null;
          this.showLoading = false;
          this.router.navigateByUrl('/cpm/dashboard');
        },
        error: (error: HttpErrorResponse) => {
          this.showLoading = false;
          if(error.status == 401){
            this.showLoading = false;
            this.badCred = "Nom d'utilisateur ou mot de passe incorrect. Réessayez."
            this.messageService.add({ severity: 'error', summary: 'Authentification échouée', detail: this.badCred+"", life: 5000, closable : false });
          }
          if(error.status == 403){
            this.showLoading = false;
            this.badCred = "Compte n'est pas active. Contacter l'administrateur."
            this.messageService.add({ severity: 'error', summary: 'Authentification échouée', detail: this.badCred+"", life: 5000, closable : false });
          }
        },
        complete: () => {
          setTimeout(() => {
            this.loading = false
        }, 2000);
        }
      }))
    }

    goToRegister(){
      this.router.navigate(['/registerAdmin']);
    }

}
