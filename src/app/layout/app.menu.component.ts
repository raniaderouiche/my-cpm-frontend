import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { LayoutService } from './service/app.layout.service';

@Component({
  selector: 'app-menu',
  templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

  model: any[] = [];

  constructor(public layoutService: LayoutService, private authenticationService : AuthenticationService) { }

  ngOnInit() {
    this.model = [
      {
        items: [
          { label: 'Tableau de bord', icon: 'pi pi-fw pi-th-large', routerLink: ['/cpm/dashboard'] },

          {
            label: 'Articles',
            icon: 'pi pi-fw pi-tags',
            routerLink: ['/cpm/items']
          },
          {
              label: 'Marchés',
              icon: 'pi pi-fw pi-shopping-bag',
              routerLink: ['/cpm/markets']
          },

        ]
      },
    ];

    if( ['SUPER_ADMIN', 'ADMIN','FINANCIER'].includes(this.authenticationService.getUserRoleFromLocalCache())){
      this.model[0]?.items.push(
        {
          label: 'Bons de Livraison',
          icon: 'pi pi-fw pi-shopping-cart',
          routerLink: ['/cpm/deliveries']
        },
      )
    }

    if( ['SUPER_ADMIN', 'ADMIN','RESPONSABLE_TRAVAUX'].includes(this.authenticationService.getUserRoleFromLocalCache())){
      this.model[0]?.items.push(
        {
          label: 'Ordres des Travail',
          icon: 'pi pi-fw pi-clone',
          routerLink: ['/cpm/workorders/manage']
      },
      )
    }

    if( ['SUPER_ADMIN', 'ADMIN','CHEF_PROJET'].includes(this.authenticationService.getUserRoleFromLocalCache())){
      this.model[0]?.items.push(
        {
          label: 'Attachements',
          icon: 'pi pi-fw pi-paperclip',
          routerLink: ['/cpm/attachments']
      },
      )
    }

    if( ['SUPER_ADMIN', 'ADMIN'].includes(this.authenticationService.getUserRoleFromLocalCache())){

      this.model[0]?.items.push(
        {
          label: 'Administration',
          icon: 'pi pi-fw pi-shield',
          items: [
              {
                  label: "Secteur d\'activité",
                  icon: 'pi pi-fw pi-circle',
                  routerLink: ['/cpm/business_sectors']
              },
              {
                  label: "Metiers",
                  icon: 'pi pi-fw pi-circle',
                  routerLink: ['/cpm/professions']
              },
              {
                label: "Gestion des Types d'Articles",
                icon: 'pi pi-fw pi-circle',
                routerLink: ['/cpm/types']
              },
          ]
      },
      {
        label: 'Comptes',
        icon: 'pi pi-fw pi-briefcase',
        items: [
            {
                label: 'Gérer',
                icon: 'pi pi-fw pi-circle',
                routerLink: ['/cpm/users']
            },

        ]
    },
      )
    }

    if(['SUPER_ADMIN'].includes(this.authenticationService.getUserRoleFromLocalCache())){
      console.log(this.model)
      this.model[0]?.items.push(

    {
        label: 'Organisations',
        icon: 'pi pi-fw pi-building',
        items: [
            {
                label: 'Gérer',
                icon: 'pi pi-fw pi-circle',
                routerLink: ['/cpm/organizations/manage']
            },
            {
                label: 'Abonnements',
                icon: 'pi pi-fw pi-circle',
                routerLink: ['/auth/error']
            },
        ]
    },
    {
        label: 'Demandes',
        icon: 'pi pi-fw pi-book',
        items: [
            {
                label: 'Approuvées',
                icon: 'pi pi-fw pi-check-circle',
                routerLink: ['/cpm/requests/approved']
            },
            {
                label: "En Attente",
                icon: 'pi pi-fw pi-info-circle',
                routerLink: ['/cpm/requests/waiting']
            },
            {
                label: "Rejetées",
                icon: 'pi pi-fw pi-times-circle',
                routerLink: ['/cpm/requests/rejected']
            },

        ]
    },
      )
    }
  }
}
