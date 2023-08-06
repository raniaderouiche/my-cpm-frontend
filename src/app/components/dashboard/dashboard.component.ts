import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { firstValueFrom, lastValueFrom, Observable } from 'rxjs';
import { BusinessSector } from 'src/app/models/BusinessSector';
import { Market } from 'src/app/models/Market';
import { Organization } from 'src/app/models/Organization';
import { Profession } from 'src/app/models/Profession';
import { PurchaseOrder } from 'src/app/models/PurchaseOrder';
import { User } from 'src/app/models/User';
import { BusinessSectorService } from 'src/app/services/business-sector.service';
import { MarketService } from 'src/app/services/market.service';
import { OrganizationService } from 'src/app/services/organization.service';
import { ProfessionService } from 'src/app/services/profession.service';
import { PurchaseOrderService } from 'src/app/services/purchaseOrder.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [MessageService],
})
export class DashboardComponent implements OnInit {

  prof_sector_data: any;

  chartOptions: any;

  users_orgs_data: any;

  basicOptions: any;

  market_orgs_data : any;

  market_profession_data : any;

  markets_type_data : any;

  amount_by_market_data: any;

  sectors: BusinessSector[] = [];
  professions: Profession[] = [];
  users: User[] = [];
  organizations : Organization[] = [];
  markets : Market[] = []
  purchase_orders : PurchaseOrder[] = []

  constructor(private organizationService : OrganizationService,private purchaseOrderService: PurchaseOrderService, private professionService: ProfessionService,private marketService: MarketService,
    private businessSectorService: BusinessSectorService,private messageService: MessageService,
    private userService : UserService) { }

  ngOnInit(){
    this.getUsers()
    this.getSectors()
    this.getProfessions()
    this.getMarkets()
    this.getOrganisations()
  }

getProfessions() {
  this.professionService.getProfessions().subscribe
    ({ next :(response: Profession[]) => {
      this.professions = response;
    }, error: (error: HttpErrorResponse) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement échoué', life: 3000 });
      },
      complete : () => {this.profession_sector_piechart()}
    })
}

getSectors() {
  this.businessSectorService.getSectors().subscribe
    ({ next : (response: BusinessSector[]) => {
      this.sectors = response;
    }, error : (error: HttpErrorResponse) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement échoué', life: 3000 });
      },
      complete : () => {}
    })
  }

profession_sector_piechart(){
  let sectorsNames = this.sectors.map(s => s.name);
    let professionsNumber = this.sectors.map(s => this.professions.filter(profession => profession.sector.name == s.name).length);

    //generate a list of random colors
    let colors = [];
    for (let i = 0; i < sectorsNames.length; i++) {
        colors.push('#' + Math.floor(Math.random() * 16777215).toString(16));
    }

    this.prof_sector_data = {
      labels: sectorsNames,
      datasets: [
          {
              data: professionsNumber,
              backgroundColor: colors,
          }
      ]
    };
}

getUsers() {
  this.userService.getUsers().subscribe(
    (data : User[]) => {
      this.users = data;
    }
  );
  }

  getOrganisations() {
    this.organizationService.getOrganizations().subscribe(
      (data : Organization[]) => {
        this.organizations = data;
        this.users_by_orgs()
        this.markets_by_orgs()
      }
    );
  }

  users_by_orgs(){
    let orgsNames = this.organizations.map(i => i.name);
    let usersNumber = this.organizations.map(i => this.users.filter(user => user.organization?.name == i?.name).length);

    let colors = '#' + Math.floor(Math.random() * 16777215).toString(16)

    this.users_orgs_data = {
      labels: orgsNames,
      datasets: [
          {
              label: 'Utilisateurs',
              backgroundColor: colors,
              data: usersNumber
          }
      ]
    };
  }

 getMarkets(){
    this.marketService.getMarkets().subscribe({
      next: (response: any) => {
        this.markets = response
        this.markets_by_professions()
        this.markets_by_types()
        this.market_by_amount()
      },
      error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement échoué', life: 3000 }),
      complete : () => {}
    })
}

getPurchaseOrders() {
  this.purchaseOrderService.getPurchaseOrders().subscribe({
    next: (response: PurchaseOrder[]) => {
      this.purchase_orders = response
    },
    error: (e) => {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Enregistrement échoué', life: 3000 });
    }
  })
}

  markets_by_orgs(){
    let orgsNames = this.organizations.map(i => i.name);
    let marketsNumber = this.organizations.map(i => this.markets.filter(market => market?.organization?.name == i.name).length);

    let colors = '#' + Math.floor(Math.random() * 16777215).toString(16)

    this.market_orgs_data = {
      labels: orgsNames,
      datasets: [
          {
              label: 'Marchés',
              backgroundColor: colors,
              data: marketsNumber
          }
      ]
    };
  }

  markets_by_professions(){
    let profNames = this.professions.map(i => i.name);
    let marketsNumber = this.professions.map(i => this.markets.filter(market => market?.profession?.name == i.name).length);

    let colors = '#' + Math.floor(Math.random() * 16777215).toString(16)

    this.market_profession_data = {
      labels: profNames,
      datasets: [
          {
              label: 'Marchés',
              backgroundColor: colors,
              data: marketsNumber
          }
      ]
    };
  }

  markets_by_types(){

    let typeNames = ["MC", "Projet"];
    let marketsNumber = typeNames.map(i => this.markets.filter(j => j.type == i).length);

    //generate a list of random colors
    let colors = [];
    for (let i = 0; i < typeNames.length; i++) {
        colors.push('#' + Math.floor(Math.random() * 16777215).toString(16));
    }

    this.markets_type_data = {
      labels: typeNames,
      datasets: [
          {
              data: marketsNumber,
              backgroundColor: colors,
          }
      ]
    };

  }

  market_by_amount(){
    let marketNames = this.markets.map(i => {return i.name});
    let marketsNumber = this.markets.map(i => {return i.amount});

    //generate a list of random colors
    let colors = '#' + Math.floor(Math.random() * 16777215).toString(16)

    this.amount_by_market_data = {
      labels: marketNames,
      datasets: [
          {
              label: 'Montant',
              backgroundColor: colors,
              data: marketsNumber
          }
      ]
    };
  }

}
