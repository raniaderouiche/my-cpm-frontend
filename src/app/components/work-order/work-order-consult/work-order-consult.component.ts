import { DefinitiveOrder } from './../../../models/DefinitiveOrder';
import { ItemUsed } from 'src/app/models/ItemUsed';
import { DefinitiveOrderService } from './../../../services/definitive-order.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PurchaseOrder } from 'src/app/models/PurchaseOrder';
import { WorkOrder } from 'src/app/models/WorkOrder';
import { MarketService } from 'src/app/services/market.service';
import { PurchaseOrderService } from 'src/app/services/purchaseOrder.service';
import { WorkOrderService } from 'src/app/services/work-order.service';
import {DataViewModule} from 'primeng/dataview';
import { Market } from 'src/app/models/Market';
import { Item } from 'src/app/models/Item';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import * as FileSaver from 'file-saver';
import { logo } from 'src/assets/data/LogoPlaceholder';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}

interface ExportColumn {
  title: string;
  dataKey: string;
}

@Component({
  selector: 'app-work-order-consult',
  templateUrl: './work-order-consult.component.html',
  styleUrls: ['./work-order-consult.component.scss'],
  providers: [MessageService]
})
export class WorkOrderConsultComponent implements OnInit {

  @ViewChild('op', {static: false}) model;

  pathId : number;
  order: PurchaseOrder;
  workOrders : WorkOrder[];
  selectedWorkOrders: WorkOrder[];

  workOrderDialog : Boolean = false;
  deleteWorkOrderDialog : Boolean = false;
  deleteWorkOrdersDialog : Boolean = false;
  itemsDialog: Boolean = false;
  addItemsDialog: Boolean = false;
  deleteDefinitiveOrderDialog : Boolean = false;

  workOrderForm: FormGroup;
  workOrder : WorkOrder;

  marketUnit : any
  market: Market;

  definitiveOrder: DefinitiveOrder;
  defOrders: DefinitiveOrder[];

  definitiveItemForm: FormGroup;

  cols!: Column[];

  exportColumns!: ExportColumn[];

  constructor(private route : ActivatedRoute,
    private messageService: MessageService,
    private marketService: MarketService,
    private router: Router,
    private purchaseOrderService : PurchaseOrderService,
    private definitiveOrderService : DefinitiveOrderService,
    private workOrderService : WorkOrderService) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.pathId = params['id'];
    });
    this.getPurchaseOrderByID()
    this.getWorkOrdersByPurchaseOrder()
    this.getMarketByPurchaseOrderID()

    //this.marketService.marketUnit.subscribe(m => this.market = m)

    this.cols = [
      { field: 'code', header: 'Code', customExportHeader: 'Product Code' },
      { field: 'nom', header: 'Nom' },
      { field: 'total', header: 'Total' },
      { field: 'total_bc', header: 'Total BC' },
      { field: 'pourcentage', header: 'Pourcentage' }
  ];

  this.exportColumns = this.cols.map((col) => ({ title: col.header, dataKey: col.field }));

    this.workOrderForm = new FormGroup({
      id: new FormControl(''),
      startDate: new FormControl('',[Validators.required]),
      limit: new FormControl('', [Validators.required]),
    })

    this.definitiveItemForm = new FormGroup({
      quantity: new FormControl('', [Validators.required]),
    })
  }

  getPurchaseOrderByID(){
    this.purchaseOrderService.getPurchaseOrderById(this.pathId).subscribe({
      next: (response: PurchaseOrder) => {
        this.order = response
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Enregistrement échoué', life: 3000 });
      }
    })
  }

  getMarketByPurchaseOrderID(){
    this.marketService.getMarketByPurchaseOrderId(this.pathId).subscribe({
      next:(response: Market) => {
        this.market = response;
        console.log(this.market)
        this.marketUnit = this.market.unit
      },
      error:(e)=>this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement échoué', life: 3000 })
    })
  }

  getWorkOrdersByPurchaseOrder(){
    this.workOrderService.getWorkOrdersByPurchaseOrder(this.pathId).subscribe({
      next: (response: WorkOrder[]) => {
        this.workOrders = response
        this.matchItem()
      },
      error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement échoué', life: 3000 }),
    })
  }

  getDefinitiveOrdersByWorkOrderID(id: number){
    this.definitiveOrderService.getDefinitiveOrdersByWorkOrderID(id).subscribe({
      next: (response: WorkOrder[]) => {
        this.defOrders = response
      },
      error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement échoué', life: 3000 }),
    })
  }

  editWorkOrder(workOrder: WorkOrder) {
    this.workOrderForm.reset()
    this.workOrder = { ...workOrder };
    this.workOrderForm.get('id').setValue(workOrder.id)
    this.workOrderForm.get('code').setValue(workOrder.code)
    this.workOrderForm.get('startDate').setValue(new Date(workOrder.startDate))
    this.workOrderForm.get('limit').setValue(workOrder.limit)
    this.workOrderForm.get('amount').setValue(workOrder.amount)
    this.workOrderDialog = true;
  }

  openWorkOrderDialog() {
    this.workOrderForm.reset()
    this.workOrder = {};
    this.workOrderDialog = true;
  }

  openOverlayPanel(){
    console.log("overlay opened")
  }

  deleteWorkOrder(workOrder: WorkOrder) {
    this.deleteWorkOrderDialog = true;
    this.workOrder = { ...workOrder };
  }

  deleteSelectedWorkOrders() {
    this.deleteWorkOrdersDialog = true;
  }

  deleteDirectiveOrder(defOrder: DefinitiveOrder) {
    this.deleteDefinitiveOrderDialog = true;
    this.definitiveOrder = { ...defOrder };
    console.log(defOrder)
  }

  openItems(workOrder: WorkOrder){
    this.workOrder = { ...workOrder };
    this.defOrders = this.workOrder?.definitiveOrders
    this.itemsDialog = true;
  }

  openAddItemsDialog(){
    this.addItemsDialog = true;
  }

  saveWorkOrder(){
    this.workOrder = {
      'id': this.workOrderForm.get('id').value,
      'startDate': this.workOrderForm.get('startDate').value,
      'limit': this.workOrderForm.get('limit').value,
      'amount': 0,
    }

    this.workOrderService.saveWorkOrder(this.workOrder, this.order.id).subscribe({
      next: (response: WorkOrder) => {
        this.workOrderForm.reset();
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: "Ordre de Travaux Enregistré", life: 3000 });
        //refresh
        this.getWorkOrdersByPurchaseOrder();
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Enregistrement échoué', life: 3000 });
      },
      complete: () => this.workOrderDialog = false
    })
  }

  confirmDeleteSelected() {
    this.deleteWorkOrdersDialog = false;
    for (let s of this.selectedWorkOrders) {
      this.workOrderService.deleteWorkOrder(s.id).subscribe({
        next: (v) => {
        this.getWorkOrdersByPurchaseOrder()
        },
        error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Suppréssion Echouée', life: 3000 }),
      })
    }
    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Les Ordres de Travaux sélectionnés ont été supprimés', life: 3000 });
    this.selectedWorkOrders = null;
  }

  confirmDelete() {
    this.deleteWorkOrderDialog = false;

    this.workOrderService.deleteWorkOrder(this.workOrder.id).subscribe({
      next: (v) => {
       this.getWorkOrdersByPurchaseOrder()
      },
      error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Suppréssion Echouée', life: 3000 }),
    })

    this.messageService.add({ severity: 'success', summary: 'Successful', detail: "l'Ordre de Travaux a été Supprimés", life: 3000 });
    this.workOrder = {};
  }

  submitItem(item : Item){

    let definitiveOrder : DefinitiveOrder = {
      'id': null,
      'item': item,
      'quantity': this.definitiveItemForm.get('quantity').value,
      'workOrder': this.workOrder
    }
    this.definitiveOrderService.saveDefinitiveOrder(definitiveOrder,this.workOrder.id).subscribe({
      next: (response: any) => {
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: "Article Ajouté", life: 3000 });
        this.getPurchaseOrderByID()
        this.getWorkOrdersByPurchaseOrder()
        this.getDefinitiveOrdersByWorkOrderID(this.workOrder.id)
        this.progressBar()
        this.model.hide();
        this.definitiveItemForm.reset();
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Ajout échoué.', life: 3000 });
      },
    })

  }

  confirmDeleteDefOrder() {
    this.deleteDefinitiveOrderDialog = false;

    this.definitiveOrderService.deleteDefinitiveOrder(this.definitiveOrder.id).subscribe({
      next: (v) => {
        this.getPurchaseOrderByID()
        this.getWorkOrdersByPurchaseOrder()
        this.getDefinitiveOrdersByWorkOrderID(this.workOrder.id)
        this.progressBar()
      },
      error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Suppréssion Echouée.', life: 3000 }),
    })

    this.messageService.add({ severity: 'success', summary: 'Successful', detail: "L'Article a été Supprimés.", life: 3000 });
  }

  total_BC = 0
  matchItem(){
    this.order?.itemsUsed.map(o => {
      this.setQuantities(o)
      this.total_BC = this.total_BC + o?.quantity
    })
  }

  items_dictionary: { [key: string]: any } = {};
  total_items = 0
  setQuantities(value: ItemUsed){
    let dictionary: { [key: string]: any } = {};
    dictionary['A_code'] = value?.item?.code
    dictionary['B_name'] = value?.item?.name
    // count the items
    let i = 0
    this.workOrders.map(order =>{
      i=i+1
      dictionary['C_OT'+ i] = order.definitiveOrders.find(x => x?.item?.id == value?.item?.id)?.quantity
      if(dictionary['C_OT'+ i] == null){
        dictionary['C_OT'+ i] = 0
      }
    })
    // add up the total
    let total = 0
    for (let key in dictionary) {
      if(key.includes("C_OT")){
        let value = dictionary[key];
        total = total + value
      }
    }
    dictionary['D_total'] = total

    dictionary['E_BC'] = this.order?.itemsUsed?.find(item => item?.item?.id == value?.item?.id)?.quantity

    dictionary['F_percentage'] = (dictionary['D_total']/dictionary['E_BC'])*100 + "%"
    this.items_dictionary[''+value?.item?.id] = dictionary
    this.total_items = this.total_items + total
  }

  progressBar(){
    let n:number
    n = (this.total_items/this.total_BC)*100
    return Math.round(n) + "%"
  }

  goToMarket(){
    this.router.navigate(['cpm/markets/',this.market.id]);
  }

  generatePDF(workorder: WorkOrder) {

    // values
    let items_prestation: DefinitiveOrder[] = []
    let items_materiel: DefinitiveOrder[] = []

    workorder?.definitiveOrders.map(i => i.price = this.order?.itemsUsed.find(j => j?.item?.id == i?.item.id)?.price)
    items_prestation = workorder?.definitiveOrders.filter(i => i?.item?.item_class == "Prestation")
    items_materiel = workorder?.definitiveOrders.filter(i => i?.item?.item_class != "Prestation")

    var img = logo
    if(this.market?.organization?.image != null){
      img = 'data:image/png;base64,'+this.market?.organization?.image?.data;
    }
    let mt_prestation = 0
    items_prestation.map(i => mt_prestation = mt_prestation + (i?.price * i?.quantity))

    let mt_materiel = 0
    items_materiel.map(i => mt_materiel = mt_materiel + (i?.price * i?.quantity))

    let mt = mt_prestation + mt_materiel
    let mt_ttc = mt + ((mt*19)/100)

    const docDefinition = {
      header: {
        text: `Date: ${new Date().toLocaleString()}`,
        alignment: 'right',
        margin: [5, 12, 10, 50],
      },
      footer: function (currentPage, pageCount) {
        return [
          // [left, top, right, bottom]
          { text: "Page " + currentPage.toString() + ' of ' + pageCount, alignment: 'left', style: 'normalText', margin: [500, 0, 0, 0] }
      ]
    },
      content: [

        {
          image: img,
          width: 75,
          alignment : 'left'
        },
        {
          text: this.market?.organization?.name,
          style: 'name'
        },
        {
          text: "Ordre des Tvs N°: " + workorder?.code,
          fontSize: 20,
          alignment: 'center',
          margin: [5, 10, 10, 20],
          color: '#000000',
          bold: true
        },
        {

          columns: [
            {
              width: 'auto',
              stack: [
                [{ text: 'Code Marché:', bold: true , margin: [0, 0, 0, 5] }],
                [{ text: 'Projet:', bold: true, margin: [0, 0, 0, 5]  }],
                [{ text: 'Code BC:', bold: true, margin: [0, 0, 0, 5]  }],
                [{ text: 'Entreprise: Code CPM: ', bold: true , margin: [0, 0, 0, 5] }],
                // You can add more text elements here
              ],
            },
            {
              width: '*',
              stack: [
                [{ text: this.market?.code , margin: [0, 0, 0, 5] }],
                [{ text: this.market?.name , margin: [0, 0, 0, 5] }],
                [{ text: this.order?.code , margin: [0, 0, 0, 5] }],
                [{ text: this.order?.organization?.code , margin: [0, 0, 0, 5] }],
                // You can add more text elements here
              ],
              style: 'columnStyle'
            },
            {
              width: 'auto',
              stack: [
                [{ text: ' ', bold: true }],
                [{ text: 'Type projet:', bold: true , margin: [0, 0, 0, 5] }],
                [{ text: 'Nom:', bold: true , margin: [0, 0, 0, 5] }],
              ],
              style: 'columnStyle'
            },
            {
              width: 'auto',
              stack: [
                [{ text: ' ', bold: true }],
                [{ text: this.market?.type , margin: [0, 0, 0, 5] }],
                [{ text: this.order?.organization?.name, margin: [0, 0, 0, 5]}],
              ],
              style: 'columnStyle'
            },
          ],

        },

        // to draw a horizantal line
        {
          table: {
                  widths: ['*'],
                  body: [[" "], [" "]]
          },
          layout: {
              hLineWidth: function(i, node) {
                  return (i === 0 || i === node.table.body.length) ? 0 : 2;
              },
              vLineWidth: function(i, node) {
                  return 0;
              },
          }
      },
      {
        text:
        "I- Prestations:",
        style: "subheader"
      },
      {
        style: "tableExample",
        table: {
          headerRows: 1,
          widths: ['auto','auto','auto','*','auto', 'auto', 'auto'],
          body: [
            ['N°','Type', 'Code article', 'Designation article', 'Unité', 'Quantité','PU'],
            ...items_prestation.map(i => ([i?.id, i?.item?.code, i?.item?.type?.name, i?.item?.name, this.market?.unit, i?.quantity, i?.price])),
          ]
        }
      },
      {
        text:
        "II- Matériels à Fournir par l'entreprise:",
        style: "subheader"
      },
      {
        style: "tableExample",
        table: {
          headerRows: 1,
          widths: ['auto','auto','auto','*','auto', 'auto', 'auto'],
          body: [
            ['N°','Type', 'Code article', 'Designation article', 'Unité', 'Quantité','PU'],
            ...items_materiel.map(i => ([i?.id, i?.item?.code, i?.item?.type?.name, i?.item?.name, this.market?.unit, i?.quantity, i?.price])),
          ]
        }
      },
      // to draw a horizantal line
      {
        table: {
                widths: ['*'],
                body: [[" "], [" "]]
        },
        layout: {
            hLineWidth: function(i, node) {
                return (i === 0 || i === node.table.body.length) ? 0 : 2;
            },
            vLineWidth: function(i, node) {
                return 0;
            },
        },
        margin: [0, 10, 0, 0],
    },
    {
      columns: [
       {
        width: '50%',
        style: "tableExample",
        layout: 'noBorders',
        table: {
          body: [
            [{ text: 'Montant Total Prestations(HTVA):', bold: true }, mt_prestation + ' ' + this.market?.unit],
            [{ text: 'Montant Total matériels (HTVA):', bold: true }, mt_materiel + ' ' + this.market?.unit],
            [{ text: 'Montant Total(HTVA):', bold: true }, mt + ' ' + this.market?.unit],
            [{ text: 'Montant TVA:', bold: true }, '19%'],
            // [{ text: 'Montant total TTC en toutes lettres:', bold: true },'........'],
          ]
        }
      },
      {
        width: '5%',
        text: ' '
      },
      {
        style: "tableExample",
        layout: 'noBorders',
        table: {
          body: [
            [{ text: ' ', bold: true }, ' '],
            [{ text: ' ', bold: true }, ' '],
            [{ text: ' ', bold: true }, ' '],
            [{ text: 'Montant Total(TTC):', bold: true },mt_ttc + ' ' + this.market?.unit],
          ]
        }
      },

      ]
    },
    // to draw a horizantal line
    {
      table: {
              widths: ['*'],
              body: [[" "], [" "]]
      },
      layout: {
          hLineWidth: function(i, node) {
              return (i === 0 || i === node.table.body.length) ? 0 : 2;
          },
          vLineWidth: function(i, node) {
              return 0;
          },
      },
      margin: [0, 2, 0, 0],
    },
    {
      text: 'Date et Signature Responsable achat',
      style: 'sign_responsable'
    },
      {
        text: 'Date et Signature Gérant',
        style: 'sign_gerant'
      },
      {
        text: 'Date et Signature Responsable Financier',
        style: 'sign_responsable',
        margin: [0, 25, 0, 0],
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
      },
      sign_gerant: {
        margin: [0, -15, 0, 0],
        alignment: 'right',
        italics: true,
        bold: true
      },
      sign_responsable: {
        alignment: 'left',
        italics: true,
        bold: true
      },
      name: {
        margin: [25,0,0,0],
        alignment: 'left',
        italics: true
      },
        columnStyle: {
          margin: [5,0] // Adjust the margin between elements in the column
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

exportPdf() {
  import('jspdf').then((jsPDF) => {
      import('jspdf-autotable').then((x) => {
          const doc = new jsPDF.default('p', 'px', 'a4');
          const dataArray = Object.values(this.items_dictionary);
          (doc as any).autoTable(this.exportColumns, dataArray);
          doc.save('products.pdf');
      });
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
