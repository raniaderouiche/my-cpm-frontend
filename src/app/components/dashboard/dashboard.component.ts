import { Attachment } from './../../models/Attachment';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { ChartData } from 'chart.js';
import { MessageService } from 'primeng/api';
import { firstValueFrom, lastValueFrom, Observable } from 'rxjs';
import { BusinessSector } from 'src/app/models/BusinessSector';
import { Market } from 'src/app/models/Market';
import { Organization } from 'src/app/models/Organization';
import { Profession } from 'src/app/models/Profession';
import { PurchaseOrder } from 'src/app/models/PurchaseOrder';
import { User } from 'src/app/models/User';
import { AttachmentService } from 'src/app/services/attachment.service';
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

  sectors: BusinessSector[] = [];
  professions: Profession[] = [];
  users: User[] = [];
  organizations : Organization[] = [];
  markets : Market[] = []
  purchase_orders : PurchaseOrder[];


  selectedMarket: Market;
  selectedOrder: PurchaseOrder
  numberOfMarkets : number;
  montantMarcheTotal:  number = 0;
  montantEngage: number = 0;
  montantTR: number = 0
  purchaseOrders: PurchaseOrder[] = []
  marketsList: Market[] = []
  purchase_ordersList : PurchaseOrder[] = []

  @Input() percentage: number = 0;
  @Input() percentage2: number = 0;
  circumference: number = 0;

  pieData: ChartData;
  doughnutData: ChartData;

  marketTypes: any[] | undefined;

  selectedType: string | undefined;

  constructor(private attachmentService: AttachmentService, private organizationService : OrganizationService,private purchaseOrderService: PurchaseOrderService, private professionService: ProfessionService,private marketService: MarketService,
    private businessSectorService: BusinessSectorService,private messageService: MessageService,
    private userService : UserService) { }

  ngOnInit(){
    this.getUsers()
    this.getMarkets()
    this.updateProgress();

    this.marketTypes = [
      { name: 'Tous', code: 'Tous' },
      { name: 'Projet', code: 'Projet' },
      { name: 'MC', code: 'MC' },
  ];
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
      }
    );
  }



 getMarkets(){
    this.marketService.getMarkets().subscribe({
      next: (response: any) => {
        this.markets = response
        this.marketsList = response
        this.numberOfMarkets = this.markets.length
        this.markets.forEach(i => {
          this.montantMarcheTotal = this.montantMarcheTotal + i.amount
          if(i.type == "Projet"){
            this.getPurchaseOrdersAmountSum(i.purchaseOrders)
          }else{
            this.getWorkOrdersAmountSum(i.purchaseOrders)
          }
        })
        this.getAttachmentSumAmount()

      },
      error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement échoué', life: 3000 }),
      complete : () => {}
    })
  }


  getPurchaseOrdersAmountSum(orders: PurchaseOrder[]){
    orders.forEach(i => {
      this.montantEngage = this.montantEngage + i.amount
    })
  }

  getWorkOrdersAmountSum(orders: PurchaseOrder[]){
    orders.forEach(i => {
      i.workOrders.forEach(j =>{
        this.montantEngage = this.montantEngage + j.amount
      })
    })
  }


  ngAfterViewInit(): void {
    this.circumference = this.calculateCircumference();
  }

  private updateProgress() {
    if (this.percentage < 0) {
      this.percentage = 0;
    } else if (this.percentage > 100) {
      this.percentage = 100;
    }
  }

  private calculateCircumference(): number {
    const radius = 45;
    return 2 * Math.PI * radius;
  }

  getAttachmentSumAmount(){
    this.attachmentService.getAttachmentSumAmount().subscribe({
      next: (response: any) => {
        this.montantTR = response
        this.percentage = Math.round(this.montantTR/this.montantEngage * 100)
        this.percentage2 = Math.round(this.montantTR/this.montantMarcheTotal * 100)
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur de Serveur', life: 3000 });
      }
    })
  }

getPurchaseOrders() {
  this.purchaseOrderService.getPurchaseOrders().subscribe({
    next: (response: PurchaseOrder[]) => {
      this.purchase_orders = response
    },
    error: (e) => {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur de Serveur', life: 3000 });
    }
  })
}

  onRadioSelect(selectedMarket: Market) {
    this.selectedMarket = selectedMarket
    // clearing the OT doughnut
    this.selectedOrder = null
    this.doughnutData = null

    this.purchaseOrders=selectedMarket?.purchaseOrders
    this.purchase_ordersList = selectedMarket?.purchaseOrders

    this.getMontantEngageParMarche(this.purchaseOrders)
    this.getAttachmentSumAmountByMarket(this.selectedMarket?.id)

    //generate a list of random colors
    let colors = [];
    for (let i = 0; i < this.purchaseOrders.length; i++) {
        colors.push('#' + Math.floor(Math.random() * 16777215).toString(16));
    }

    this.pieData = {
      labels: this.purchaseOrders.map(order => order.code),
      datasets: [
        {
          data: this.purchaseOrders.map(order => order.amount),
          backgroundColor: colors
        },
      ],
    };
  }

  onRadioSelectOrder(order: PurchaseOrder){
    this.selectedOrder = order

    //generate a list of random colors
    let colors = [];
    for (let i = 0; i < this.selectedOrder?.workOrders.length; i++) {
        colors.push('#' + Math.floor(Math.random() * 16777215).toString(16));
    }

    this.doughnutData = {
      labels: this.selectedOrder?.workOrders.map(order => order.code),
      datasets: [
        {
          data: this.selectedOrder?.workOrders.map(order => order.amount),
          backgroundColor: colors
        },
      ],
    };
  }

  mtEngageMarche: number = 0
  getMontantEngageParMarche(purchaseOrders : PurchaseOrder[]){
    this.mtEngageMarche = 0
    purchaseOrders.map(i => this.mtEngageMarche = this.mtEngageMarche + i.amount)
  }

  mtTRMarche: number = 0
  getAttachmentSumAmountByMarket(id: number){
    this.attachmentService.getAttachmentSumAmountByMarket(id).subscribe({
      next: (response: any) => {
        this.mtTRMarche = response
        console.log("TR" + this.mtTRMarche)
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur de Serveur', life: 3000 });
      }
    })
  }

  onDropdownChange() {
    console.log('Selected option:', this.selectedType['name']);
    if(this.selectedType['name'] == "Tous"){
      this.marketsList = this.markets
    }else{
      this.marketsList = this.markets.filter(i => i.type == this.selectedType['name'])
    }
  }

  onInputChange(event: Event) {
    const inputValue = (event.target as HTMLInputElement).value;
    console.log(inputValue);
    if(inputValue == ""){
      this.purchase_ordersList = this.purchase_orders
    }else{
      this.purchase_ordersList = this.purchase_orders.filter(i=>i.code.includes(this.searchTerm.toString()))
    }

  }

  searchTerm: string = '';

  filterList() {
    console.log('Search term:', this.searchTerm);
    console.log('Search term:', this.purchase_orders.find(i=>i.code === "39BC2023"));
    this.purchase_ordersList = this.purchase_orders.filter(i=>i.code.includes(this.searchTerm.toString()));
  }

}
