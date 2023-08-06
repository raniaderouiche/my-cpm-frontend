import { ItemDelivered } from './../../../models/ItemDelivered';
import { Delivery } from './../../../models/Delivery';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { PurchaseOrder } from 'src/app/models/PurchaseOrder';
import { WorkOrder } from 'src/app/models/WorkOrder';
import { Item } from 'src/app/models/Item';
import { DeliveryService } from 'src/app/services/delivery.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemDeliveredService } from 'src/app/services/item-delivered.service';
import { PurchaseOrderService } from 'src/app/services/purchaseOrder.service';
import { WorkOrderService } from 'src/app/services/work-order.service';
import { MarketService } from 'src/app/services/market.service';
import { Market } from 'src/app/models/Market';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import * as FileSaver from 'file-saver';
import { logo } from 'src/assets/data/LogoPlaceholder';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
@Component({
  selector: 'app-delivery-manage',
  templateUrl: './delivery-manage.component.html',
  styleUrls: ['./delivery-manage.component.scss'],
  providers: [MessageService]
})
export class DeliveryManageComponent implements OnInit {

  @ViewChild('opanel', {static: false}) model;

  deliveryForm: FormGroup;

  deliveryDialog: boolean= false;
  deleteDeliveryDialog: boolean = false;
  deleteDeliveriesDialog: boolean = false;
  addItemsDialog: boolean = false;
  itemsDialog : boolean = false;
  deleteItemDialog: boolean = false;

  delivery : Delivery;
  deliveries : Delivery[];
  selectedDeliveries: Delivery[];

  pathId : number;

  purchaseOrder: PurchaseOrder
  workOrder: WorkOrder;
  market: Market

  items: Item[]=[];

  itemDlvrd: ItemDelivered
  itemsDelivered: ItemDelivered[];

  deliveryType : string

  itemDeliveredForm: FormGroup;

  isMP : boolean

  constructor(private deliveryService: DeliveryService,
    private route : ActivatedRoute,
    private marketService: MarketService,
    private router: Router,
    private itemsDeliveredService: ItemDeliveredService,
    private purchaseOrderService : PurchaseOrderService,
    private messageService: MessageService,
    private workOrderService : WorkOrderService) { }

    ngOnInit(): void {

      this.deliveries = [];
      this.route.paramMap.subscribe(params => {
        this.pathId = Number(params.get('id'));
        this.deliveryType = params.get('type');
      });

      if(this.deliveryType == "mp"){
        this.getOrderByID()
        this.getDeliveryByOrder();
        this.getMarketByPurchaseOrderID()
        this.isMP = true
      }
      if(this.deliveryType == "mc"){
        this.getOrderByWorkOrderID()
        this.getWorkOrdersByID();
        this.getDeliveryByWorkOrder();
        this.getMarketByWorkOrderID()
        this.isMP = false
      }

      this.deliveryForm = new FormGroup({
        id: new FormControl(''),
        code: new FormControl('',[Validators.required]),
        creationDate: new FormControl('',[Validators.required]),
        deliveryDate: new FormControl('',[Validators.required]),
        amount:new FormControl('')
      })

      this.itemDeliveredForm = new FormGroup({
        quantity: new FormControl('', [Validators.required]),
        price: new FormControl('', [Validators.required]),
      })
    }

    getDeliveryByOrder() {
      this.deliveryService.getDeliveryByOrderId(this.pathId).subscribe({
        next: (response: Delivery[]) => {this.deliveries = response
        console.log(response)},
        error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement échoué', life: 3000 }),
      })
    }

    getDeliveryByWorkOrder() {
      this.deliveryService.getDeliveryByWorkOrderId(this.pathId).subscribe({
        next: (response: Delivery[]) => this.deliveries = response,
        error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement échoué', life: 3000 }),
      })
    }

    getOrderByID() {
      this.purchaseOrderService.getPurchaseOrderById(this.pathId).subscribe({
        next: (response: PurchaseOrder) => {this.purchaseOrder = response
          this.purchaseOrder?.itemsUsed.map(item => this.items.push(item?.item))
        console.log(this.items)},
        error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement échoué', life: 3000 }),
      })
    }

    getOrderByWorkOrderID() {
      this.purchaseOrderService.getPurchaseOrderByWorkOrderId(this.pathId).subscribe({
        next: (response: PurchaseOrder) => {this.purchaseOrder = response
          this.purchaseOrder?.itemsUsed.map(item => this.items.push(item?.item))
        console.log(this.items)},
        error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement échoué', life: 3000 }),
      })
    }

    getWorkOrdersByID(){
      this.workOrderService.getWorkOrderById(this.pathId).subscribe({
        next: (response: WorkOrder) => {
          this.workOrder = response
          console.log(this.workOrder)
        },
        error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement échoué', life: 3000 }),
      })
    }

    getItemsDeliveredByDeliveryId(id : number) {
      this.itemsDeliveredService.getItemsDeliveredByDeliveryId(id).subscribe({
        next: (response: ItemDelivered[]) => this.itemsDelivered = response,
        error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement échoué', life: 3000 }),
      })
    }

    getMarketByPurchaseOrderID(){
      this.marketService.getMarketByPurchaseOrderId(this.pathId).subscribe({
        next:(response: Market) => {
          this.market = response;
          this.matchItem()
        },
        error:(e)=>this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement échoué', life: 3000 })
      })
    }

    getMarketByWorkOrderID(){
      this.marketService.getMarketByWorkOrderId(this.pathId).subscribe({
        next:(response: Market) => {
          this.market = response;
          this.matchItem()
        },
        error:(e)=>this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement échoué', life: 3000 })
      })
    }

    openDeliveryDialog() {
      this.deliveryForm.reset()
      this.delivery = {};
      this.deliveryDialog = true;
    }

    deleteSelectedDeliveries() {
      this.deleteDeliveriesDialog = true;
    }

    editDelivery(delivery : Delivery) {
      this.deliveryForm.reset()
      this.delivery = { ...delivery };
      this.deliveryForm.get('id').setValue(delivery.id)
      this.deliveryForm.get('code').setValue(delivery.code)
      this.deliveryForm.get('creationDate').setValue(new Date(delivery.creationDate))
      this.deliveryForm.get('deliveryDate').setValue(new Date(delivery.deliveryDate))
      this.deliveryForm.get('amount').setValue(delivery.amount)
      this.deliveryDialog = true;
    }

    deleteDelivery(delivery : Delivery) {
      this.deleteDeliveryDialog = true;
      this.delivery = { ...delivery };
    }

    saveDelivery() {
      if(this.deliveryType == "mp"){
        this.delivery = {
          'id': this.deliveryForm.get('id').value,
          'code': this.deliveryForm.get('code').value,
          'creationDate': this.deliveryForm.get('creationDate').value,
          'deliveryDate': this.deliveryForm.get('deliveryDate').value,
          'amount':this.deliveryForm.get('amount').value,
          'purchaseOrder': this.purchaseOrder
        }
      }
      if(this.deliveryType == "mc"){
        this.delivery = {
          'id': this.deliveryForm.get('id').value,
          'code': this.deliveryForm.get('code').value,
          'creationDate': this.deliveryForm.get('creationDate').value,
          'deliveryDate': this.deliveryForm.get('deliveryDate').value,
          'amount':this.deliveryForm.get('amount').value,
          'workOrder': this.workOrder
        }
      }


      console.log(this.delivery);

      this.deliveryService.saveDelivery(this.delivery).subscribe({
        next: (response: Delivery) => {
          this.deliveryForm.reset();
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: "Bon de Livraison Enregistré", life: 3000 });
        },
        error: (e) => {
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Enregistrement échoué', life: 3000 });
        },
        complete: () => {
          this.deliveryDialog = false
          if(this.deliveryType == "MP"){
            this.getDeliveryByOrder();
          }
          if(this.deliveryType == "MC"){
            this.getWorkOrdersByID();
            this.getDeliveryByWorkOrder();
          }
          this.matchItem()
        }
      })
    }

    submitItem(item : Item){
      this.model.hide();
      let itemDelivered : ItemDelivered = {
        'id': null,
        'item': item,
        'quantity': this.itemDeliveredForm.get('quantity').value,
        'price': this.itemDeliveredForm.get('price').value,
        'delivery': this.delivery
      }

      console.log(itemDelivered)

      this.itemsDeliveredService.saveItemDelivered(itemDelivered,itemDelivered?.delivery?.id).subscribe({
        next: (response: any) => {
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: "Article Ajouté", life: 3000 });
          this.getItemsDeliveredByDeliveryId(itemDelivered?.delivery?.id)
        },
        error: (e) => {
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Ajout échoué', life: 3000 });
        },
        complete: () => {
          this.itemDeliveredForm.reset();
          if(this.deliveryType == "MP"){
            this.getDeliveryByOrder();
          }
          if(this.deliveryType == "MC"){
            this.getWorkOrdersByID();
            this.getDeliveryByWorkOrder();
          }
        }
      })

    }

    confirmDeleteSelected() {
      this.deleteDeliveriesDialog = false;
      for (let s of this.selectedDeliveries) {
        this.deliveryService.deleteDelivery(s.id).subscribe({
          next: (v) => this.getDeliveryByOrder(),
          error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Suppréssion Echouée', life: 3000 }),
          complete: () => {
            if(this.deliveryType == "MP"){
              this.getDeliveryByOrder();
            }
            if(this.deliveryType == "MC"){
              this.getWorkOrdersByID();
              this.getDeliveryByWorkOrder();
            }
          }
        })
      }
      this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Les Bons de Livraison sélectionnés ont été supprimés', life: 3000 });
      this.selectedDeliveries = null;
    }

    confirmDelete() {
      this.deleteDeliveryDialog = false;

      this.deliveryService.deleteDelivery(this.delivery.id).subscribe({
        next: (v) => this.getDeliveryByOrder(),
        error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Suppréssion Echouée', life: 3000 }),
        complete: () => {
          this.deleteDeliveryDialog = false
          if(this.deliveryType == "MP"){
            this.getDeliveryByOrder();
          }
          if(this.deliveryType == "MC"){
            this.getWorkOrdersByID();
            this.getDeliveryByWorkOrder();
          }
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: "Le Bon de Livraison a été Supprimés", life: 3000 });
          this.delivery = {};
        }
      })


    }


    openItems(delivery: Delivery){
      this.delivery = { ...delivery };
      this.itemsDelivered = delivery?.itemsDelivered
      this.itemsDialog = true;
    }

    openAddItemsDialog(){
      this.addItemsDialog = true;
    }

    deleteItemDeliveredOrder(item : ItemDelivered){
      this.deleteItemDialog = true;
      this.itemDlvrd = {...item}
    }

    deleteItemDelivered(){
      this.itemsDeliveredService.deleteItemDelivered(this.itemDlvrd.id).subscribe({
        next: (v) => this.getItemsDeliveredByDeliveryId(this.delivery.id),
        error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Suppréssion Echouée', life: 3000 }),
        complete: () => {
          this.deleteItemDialog = false
          this.messageService.add({ severity: 'success', summary: 'Successful', detail: "Les Bons de Livraison ont été Supprimés", life: 3000 });
          this.itemDlvrd = {};
          if(this.deliveryType == "MP"){
            this.getDeliveryByOrder();
          }
          if(this.deliveryType == "MC"){
            this.getWorkOrdersByID();
            this.getDeliveryByWorkOrder();
          }
        }
      })
    }

    total_BC = 0
  matchItem(){
    this.purchaseOrder?.itemsUsed.map(o => {
      this.setQuantities(o)
      this.total_BC = this.total_BC + o?.quantity
    })
  }

  items_dictionary: { [key: string]: any } = {};
  total_items = 0
  setQuantities(value: ItemDelivered){
    let dictionary: { [key: string]: any } = {};
    dictionary['A_code'] = value?.item?.code
    dictionary['B_name'] = value?.item?.name
    // count the items
    let i = 0
    this.deliveries.map(del =>{
      i=i+1
      dictionary['C_BL'+ i] = del.itemsDelivered.find(x => x?.item?.id == value?.item?.id)?.quantity
      if(dictionary['C_BL'+ i] == null){
        dictionary['C_BL'+ i] = 0
      }
    })
    // add up the total
    let total = 0
    for (let key in dictionary) {
      if(key.includes("C_BL")){
        let value = dictionary[key];
        total = total + value
      }
    }
    dictionary['D_total'] = total

    dictionary['E_BC'] = this.purchaseOrder?.itemsUsed?.find(item => item?.item?.id == value?.item?.id)?.quantity

    dictionary['F_percentage'] = (dictionary['D_total']/dictionary['E_BC'])*100 + "%"
    this.items_dictionary[''+value?.item?.id] = dictionary
    this.total_items = this.total_items + total
    console.log(this.items_dictionary)
  }

  progressBar(){
    let n:number
    n = (this.total_items/this.total_BC)*100
    return Math.round(n) + "%"
  }

    goToMarket(){
      this.router.navigate(['cpm/markets/',this.market.id]);
    }


  generatePDF(delivery: Delivery) {

      let creation_date = new Date(delivery?.creationDate)
      let creation_date_to_string = creation_date.getDay() + "/" + creation_date.getMonth() + "/" + creation_date.getFullYear()

      let delivery_date = new Date(delivery?.deliveryDate)
      let delivery_date_to_string = delivery_date.getDay() + "/" + delivery_date.getMonth() + "/" + delivery_date.getFullYear()

      const docDefinition = {
        header: {
          text: `Date: ${new Date().toLocaleString()}`,
          alignment: 'right',
          margin: [5,2,2],
        },
        content: [
          {
            text: "Marché: " + this.market?.code,
            fontSize: 24,
            alignment: 'center',
            margin: [5, 2, 10, 50],
            color: '#047886'
          },

          { text: "Bon de Livraison", style: "header" },

          "Détails du bon de livraison:",
          {
            style: "tableExample",
            layout: 'noBorders',
            table: {
              body: [
                ['Code: ', delivery?.code],
                ['Montant: ', delivery?.amount +" "+this.market?.unit],
              ['Date de création: ', creation_date_to_string],
              ['Date de livraison: ', delivery_date_to_string],
              ]
            }
          },
          {
            text:
            "Articles",
            style: "subheader"
          },
          "Liste d'articles utilisés dans le bon de livraison':",
          {
            style: "tableExample",
            table: {
              headerRows: 1,
              widths: ['*', 'auto','auto'],
              body: [
                ['Article', 'Quantité','Prix en ' + this.market?.unit],
                ...delivery?.itemsDelivered?.map(i => ([i?.item?.name, i?.quantity,i?.price])),
              ]
            }
          },
        ],

        styles: {
          header: {
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 10]
          },
          subheader: {
            fontSize: 16,
            bold: true,
            margin: [0, 10, 0, 5]
          },
          tableExample: {
            margin: [0, 5, 0, 15]
          }
        }
      };

      pdfMake.createPdf(docDefinition).open();
    }

    exportExcel() {
      import('xlsx').then((xlsx) => {
        const dataArray = Object.values(this.items_dictionary);
          const worksheet = xlsx.utils.json_to_sheet(dataArray);
          const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
          const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
          this.saveAsExcelFile(excelBuffer, 'products');
      });
  }
  saveAsExcelFile(buffer: any, fileName: string): void {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    let EXCEL_EXTENSION = '.xlsx';
    const data: Blob = new Blob([buffer], {
        type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
}
}
