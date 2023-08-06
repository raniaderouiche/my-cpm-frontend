import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Market } from 'src/app/models/Market';
import { PurchaseOrder } from 'src/app/models/PurchaseOrder';
import { DeliveryService } from 'src/app/services/delivery.service';
import { MarketService } from 'src/app/services/market.service';

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.scss'],
  providers: [MessageService]
})
export class DeliveryComponent implements OnInit {

  mp: Market[];
  mc: Market[];

  orderMP : PurchaseOrder[]
  orderMC : PurchaseOrder[]
  workOrderListDialog: boolean = false;
  purchaseOrder: PurchaseOrder

  constructor(
    private marketService: MarketService,
    private deliveryService: DeliveryService,
    private router: Router,
    private messageService: MessageService,) { }

  ngOnInit(): void {
    this.getMCs()
    this.getMPs()
  }

  getMCs() {
    this.marketService.getMarketsByType("MC").subscribe({
      next: (response: Market[]) => {
        this.mc = response
        this.mc = this.mc.filter(m => m.purchaseOrders = m.purchaseOrders.filter(order => order.type == "Fourniture et Matériel"))
      },
      error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement échoué', life: 3000 }),
    })
  }

  getMPs() {
    this.marketService.getMarketsByType("Projet").subscribe({
      next: (response: Market[]) => {
        this.mp = response
        this.mp = this.mp.filter(m => m.purchaseOrders = m.purchaseOrders.filter(order => order.type == "Fourniture et Matériel"))
      },
      error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement échoué', life: 3000 }),
    })
  }

  showWorkOrders(purchaseOrder: PurchaseOrder){
    this.workOrderListDialog = true
    this.purchaseOrder = {...purchaseOrder}
  }

  setDeliveryType(type: string){
    this.deliveryService.setDeliveryType(type);
  }

  viewDeliveryMP(id: number){
    let type = "mp"
    this.router.navigate(['cpm/deliveries/order/',type,id]);
  }

  viewDeliveryMC(id: number){
    let type = "mc"
    this.router.navigate(['cpm/deliveries/order/',type,id]);
  }

}
