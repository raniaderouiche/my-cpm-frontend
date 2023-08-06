import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Attachment } from 'src/app/models/Attachment';
import { Item } from 'src/app/models/Item';
import { Market } from 'src/app/models/Market';
import { PurchaseOrder } from 'src/app/models/PurchaseOrder';
import { AttachmentService } from 'src/app/services/attachment.service';
import { ItemService } from 'src/app/services/item.service';
import { MarketService } from 'src/app/services/market.service';
import { PurchaseOrderService } from 'src/app/services/purchaseOrder.service';

@Component({
  selector: 'app-attachment',
  templateUrl: './attachment.component.html',
  styleUrls: ['./attachment.component.scss'],
  providers: [MessageService]

})
export class AttachmentComponent implements OnInit {
  mp: Market[];
  mc: Market[];

  unit: string;

  workOrderListDialog: boolean = false;
  purchaseOrder: PurchaseOrder

  constructor(
    private marketService: MarketService,
    private attachmentService: AttachmentService,
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
      },
      error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement échoué', life: 3000 }),
    })
  }

  getMPs() {
    this.marketService.getMarketsByType("Projet").subscribe({
      next: (response: Market[]) => {
        this.mp = response
      },
      error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement échoué', life: 3000 }),
    })
  }

  showWorkOrders(purchaseOrder: PurchaseOrder,market: Market){
    this.workOrderListDialog = true
    this.purchaseOrder = {...purchaseOrder}
    this.unit = market?.unit
  }

  setAttachmentType(type: string){
    this.attachmentService.setAttachmentType(type);
  }

  viewAttachmentMP(id: number){
    let type = "mp"
    this.router.navigate(['cpm/attachments/order/',type,id]);
  }

  viewAttachmentMC(id: number){
    let type = "mc"
    this.router.navigate(['cpm/attachments/order/',type,id]);
  }

}
