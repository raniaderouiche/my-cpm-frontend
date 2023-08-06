import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { User } from 'src/app/models/User';
import { OrganizationService } from 'src/app/services/organization.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  providers: [MessageService],
})
export class ProfileComponent implements OnInit {

  user : User;

  constructor(private userService: UserService,
              private organizationService : OrganizationService,
              private layoutService: LayoutService,
              private messageService: MessageService) { }

  ngOnInit(): void {
    //this.layoutService.colapseMenu();
    this.getUser()
  }

  getUser(){
      this.userService.getUserByToken().subscribe({
        next: (response: User) => this.user = response,
        error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement échoué', life: 3000 }),
      })
  }

}
