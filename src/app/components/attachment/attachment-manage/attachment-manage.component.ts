import { ItemRealisedService } from './../../../services/item-realised.service';
import { ItemRealised } from './../../../models/ItemRealised';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Attachment } from 'src/app/models/Attachment';
import { Item } from 'src/app/models/Item';
import { PurchaseOrder } from 'src/app/models/PurchaseOrder';
import { AttachmentService } from 'src/app/services/attachment.service';
import { PurchaseOrderService } from 'src/app/services/purchaseOrder.service';
import { WorkOrder } from 'src/app/models/WorkOrder';
import { WorkOrderService } from 'src/app/services/work-order.service';
import { MarketService } from 'src/app/services/market.service';
import { Market } from 'src/app/models/Market';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { concat, of } from 'rxjs';
import { catchError, tap, toArray } from 'rxjs/operators';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as FileSaver from 'file-saver';
import { logo } from 'src/assets/data/LogoPlaceholder';
@Component({
  selector: 'app-attachment-manage',
  templateUrl: './attachment-manage.component.html',
  styleUrls: ['./attachment-manage.component.scss'],
  providers: [MessageService]
})
export class AttachmentManageComponent implements OnInit {

  @ViewChild('op', {static: false}) model;

  attachmentForm: FormGroup;

  attachmentDialog: boolean= false;
  deleteAttachmentDialog: boolean = false;
  deleteAttachmentsDialog: boolean = false;
  addItemsDialog: boolean = false;
  itemsDialog : boolean = false;
  deleteItemDialog: boolean = false;

  attachment : Attachment;
  attachments : Attachment[];
  selectedAttachments: Attachment[];

  pathId : number;

  order: PurchaseOrder
  workOrder: WorkOrder;
  market: Market

  items: Item[]=[];

  itemRlsd: ItemRealised
  itemsRealised: ItemRealised[];

  attType : string

  isMP : boolean // to clearify if market selected is MC or MP

  ItemRealisedForm: FormGroup;

  constructor(
    private attachmentService: AttachmentService,
    private route : ActivatedRoute,
    private marketService: MarketService,
    private router: Router,
    private itemsRealisedService: ItemRealisedService,
    private purchaseOrderService : PurchaseOrderService,
    private messageService: MessageService,
    private workOrderService : WorkOrderService) { }

  ngOnInit(): void {

    this.attachments = [];

    this.route.paramMap.subscribe(params => {
      this.pathId = Number(params.get('id'));
      this.attType = params.get('type');
    });

    if(this.attType == "mp"){
      this.executeSequenceMP()
      this.isMP = true
    }
    if(this.attType == "mc"){
      this.executeSequenceMC()
      this.isMP = false
    }

    this.attachmentForm = new FormGroup({
      id: new FormControl(''),
      code: new FormControl('',[Validators.required]),
      date: new FormControl('',[Validators.required]),
    })

    this.ItemRealisedForm = new FormGroup({
      quantity: new FormControl('', [Validators.required]),
    })
  }

//------- Projet ------

  executeSequenceMP() {
    // Create the sequence
    const sequence$ = concat(
      this.getOrderByID(),
      this.getAttachmentByOrder(),
      this.getMarketByPurchaseOrderID()
    );

    sequence$.pipe(
    tap((data) => {
      // Use console.log to check if data is emitted by each method
      //console.log(data);
    }),
    toArray()
  )
  .subscribe((data: any) => {
    // The 'data' variable will be an array containing all emitted values
    console.log('All methods executed successfully.');

    this.order = data[0]
    if(this.items.length == 0){
      this.order?.itemsUsed.map(item => this.items.push(item?.item))
    }
    this.attachments = data[1]
    console.log(this.attachments);
    this.market = data[2];
    console.log(this.market);
    this.matchItem()
  });
  }

   // Method 1
   getOrderByID() {
    return this.purchaseOrderService.getPurchaseOrderById(this.pathId).pipe(
      catchError((error) => {
        console.error('Error in getOrderByID:', error);
        // Handle the error or re-throw if needed
        return of(null);
      })
    );
  }

  // Method 2
  getAttachmentByOrder() {
    return this.attachmentService.getAttachmentByOrderId(this.pathId).pipe(
      catchError((error) => {
        console.error('Error in getAttachmentByOrder:', error);
        // Handle the error or re-throw if needed
        return of(null);
      })
    );
  }

  // Method 3
  getMarketByPurchaseOrderID() {
    return this.marketService.getMarketByPurchaseOrderId(this.pathId).pipe(
      catchError((error) => {
        console.error('Error in getMarketByPurchaseOrderID:', error);
        // Handle the error or re-throw if needed
        return of(null);
      })
    );
  }

//------- Fin Projet ------

// ------------ Cadre -----------

executeSequenceMC() {
  // Get the pathId from wherever it is available
  const pathId = 'your_path_id';

  // Create the sequence
  const sequence$ = concat(
    this.getOrderByWorkOrderID(),
    this.getWorkOrdersByID(),
    this.getAttachmentByWorkOrder(),
    this.getMarketByWorkOrderID()
  );

  // Subscribe to the sequence and handle the data and errors separately
  sequence$.pipe(
    tap((data) => {
      // Use console.log to check if data is emitted by each method
      //console.log(data);
    }),
    toArray()
  )
  .subscribe((data: any) => {
    // The 'data' variable will be an array containing all emitted values
    console.log('All methods executed successfully.');

    this.order = data[0]
    if(this.items.length == 0){
      this.order?.itemsUsed.map(item => this.items.push(item?.item))
    }
    this.workOrder = data[1]
    this.attachments = data[2];
    this.market = data[3];
    this.matchItem()
  });
}

// Method 1
getWorkOrdersByID() {
  return this.workOrderService.getWorkOrderById(this.pathId).pipe(
    catchError((error) => {
      console.error('Error in getOrderByID:', error);
      // Handle the error or re-throw if needed
      return of(null);
    })
  );
}

// Method 2
getAttachmentByWorkOrder() {
  return this.attachmentService.getAttachmentByWorkOrderId(this.pathId).pipe(
    catchError((error) => {
      console.error('Error in getOrderByID:', error);
      // Handle the error or re-throw if needed
      return of(null);
    })
  );
}

// Method 3
getMarketByWorkOrderID() {
  return this.marketService.getMarketByWorkOrderId(this.pathId).pipe(
    catchError((error) => {
      console.error('Error in getOrderByID:', error);
      // Handle the error or re-throw if needed
      return of(null);
    })
  );
}

// Method 4
getOrderByWorkOrderID() {
  return this.purchaseOrderService.getPurchaseOrderByWorkOrderId(this.pathId).pipe(
    catchError((error) => {
      console.error('Error in getOrderByID:', error);
      // Handle the error or re-throw if needed
      return of(null);
    })
  );
}

// --------- Fin Cadre -----------


  getItemsRealisedByAttachmentId(id : number) {
    this.itemsRealisedService.getItemsRealisedByAttachmentId(id).subscribe({
      next: (response: ItemRealised[]) => this.itemsRealised = response,
      error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement échoué', life: 3000 }),
    })
  }

  openAttachementsDialog() {
    this.attachmentForm.reset()
    this.attachment = {};
    this.attachmentDialog = true;
  }

  deleteSelectedAttachments() {
    this.deleteAttachmentsDialog = true;
  }

  editAttachment(attachment: Attachment) {
    this.attachmentForm.reset()
    this.attachment = { ...attachment };
    this.attachmentForm.get('id').setValue(attachment.id)
    this.attachmentForm.get('code').setValue(attachment.code)
    this.attachmentForm.get('date').setValue(new Date(attachment.attachmentDate))
    this.attachmentDialog = true;
  }

  deleteAttachment(attachment: Attachment) {
    this.deleteAttachmentDialog = true;
    this.attachment = { ...attachment };
  }

  saveAttachment() {
    if(this.attType == "mp"){
      this.attachment = {
        'id': this.attachmentForm.get('id').value,
        'code': this.attachmentForm.get('code').value,
        'attachmentDate': this.attachmentForm.get('date').value,
        'purchaseOrder': this.order
      }
    }
    if(this.attType == "mc"){
      this.attachment = {
        'id': this.attachmentForm.get('id').value,
        'code': this.attachmentForm.get('code').value,
        'attachmentDate': this.attachmentForm.get('date').value,
        'workOrder': this.workOrder
      }
    }

    this.attachmentService.saveAttachment(this.attachment).subscribe({
      next: (response: Attachment) => {
        this.attachmentForm.reset();
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: "Attachement Enregistré", life: 3000 });
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Enregistrement échoué', life: 3000 });
      },
      complete: () => {
        this.attachmentDialog = false
        if(this.attType == "mp"){
          this.executeSequenceMP();
        }

        if(this.attType == "mc"){
          this.executeSequenceMC();
        }
      }
    })
  }

  submitItem(item : Item){
    this.model.hide();
    let itemRealised : ItemRealised = {
      'id': null,
      'item': item,
      'quantity': this.ItemRealisedForm.get('quantity').value,
      'attachment': this.attachment
    }

    if(this.ItemRealisedForm?.valid){
      this.itemsRealisedService.saveItemRealised(itemRealised,itemRealised?.attachment?.id).subscribe({
        next: (response: any) => {
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: "Article Ajouté", life: 3000 });
          this.ItemRealisedForm.reset()
          this.getItemsRealisedByAttachmentId(itemRealised?.attachment?.id)
        },
        error: (e) => {
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Ajout échoué', life: 3000 });
        },
        complete: () => {
          if(this.attType == "mp"){
            this.executeSequenceMP();
          }

          if(this.attType == "mc"){
            this.executeSequenceMC();
          }
          this.ItemRealisedForm.reset();
        }
      })
    }else{
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Ajout échoué', life: 3000 });
    }
  }

  confirmDeleteSelected() {
    this.deleteAttachmentsDialog = false;
    for (let s of this.selectedAttachments) {
      this.attachmentService.deleteAttachment(s.id).subscribe({
        next: (v) => this.getAttachmentByOrder(),
        error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Suppréssion Echouée', life: 3000 }),
        complete: () => {
          if(this.attType == "mp"){
            this.executeSequenceMP();
          }

          if(this.attType == "mc"){
            this.executeSequenceMC();
          }
        }
      })
    }
    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Les Attachements sélectionnés ont été supprimés', life: 3000 });
    this.selectedAttachments = null;
  }

  confirmDelete() {
    this.deleteAttachmentDialog = false;

    this.attachmentService.deleteAttachment(this.attachment.id).subscribe({
      next: (v) => this.getAttachmentByOrder(),
      error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Suppréssion Echouée', life: 3000 }),
      complete: () => {
        this.attachmentDialog = false
        if(this.attType == "mp"){
          this.executeSequenceMP();
        }

        if(this.attType == "mc"){
          this.executeSequenceMC();
        }
      }
    })

    this.messageService.add({ severity: 'success', summary: 'Successful', detail: "L'Attachement a été Supprimés", life: 3000 });
    this.attachment = {};
  }


  openItems(attachment: Attachment){
    this.attachment = { ...attachment };
    this.itemsRealised = attachment?.itemsRealised
    this.itemsDialog = true;
  }

  openAddItemsDialog(){
    this.addItemsDialog = true;
  }

  deleteItemRealisedOrder(item : ItemRealised){
    this.deleteItemDialog = true;
    this.itemRlsd = {...item}
  }

  deleteItemRealised(){
    this.itemsRealisedService.deleteItemRealised(this.itemRlsd.id).subscribe({
      next: (v) => this.getItemsRealisedByAttachmentId(this.attachment.id),
      error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Suppréssion Echouée', life: 3000 }),
      complete: () => {
        this.deleteItemDialog = false
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: "L'Attachement a été Supprimés", life: 3000 });
        this.itemRlsd = {};
        if(this.attType == "mp"){
          this.executeSequenceMP();
        }

        if(this.attType == "mc"){
          this.executeSequenceMC();
        }
      }
    })
  }

  total_BC = 0
  loading = false
  matchItem(){
    this.loading = true
    this.attachments.map(a => a.itemsRealised.map(o => {
      this.setQuantities(o)
      this.total_BC = this.total_BC + o?.quantity
    }))
    setTimeout(() => {
      this.loading = false
    }, 2000);
  }

  items_dictionary: { [key: string]: any } = {};
  total_items = 0
  setQuantities(value: ItemRealised){
    let dictionary: { [key: string]: any } = {};
    dictionary['A_code'] = value?.item?.code
    dictionary['B_name'] = value?.item?.name
    // count the items
    let i = 0
    let total = 0
    this.attachments.map(att =>{
      i=i+1
      dictionary['C_ATT'+ i] = att.itemsRealised.find(x => x?.item?.id == value?.item?.id)?.quantity
      if(dictionary['C_ATT'+ i] == null){
        dictionary['C_ATT'+ i] = 0
      }
      total = total + dictionary['C_ATT'+ i]
    })
    dictionary['D_total'] = total.toFixed(2)

    dictionary['E_BC'] = this.order?.itemsUsed?.find(item => item?.item?.id == value?.item?.id)?.quantity

    //dictionary['F_percentage'] = Math.round((dictionary['D_total']/dictionary['E_BC'])*100).toFixed(2) + "%"

    dictionary['F_ecart'] = Math.round(((dictionary['D_total'] - dictionary['E_BC'])/dictionary['E_BC'])*100).toFixed(2) + "%"
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


  generatePDF(attachment: Attachment) {

    // values
    let items_prestation: ItemRealised[] = []
    let items_materiel: ItemRealised[] = []

    attachment?.itemsRealised.map(i => i.price = this.order?.itemsUsed.find(j => j?.item?.id == i?.item.id)?.price)

    items_prestation = attachment?.itemsRealised.filter(i => i?.item?.item_class == "Prestation")
    items_materiel = attachment?.itemsRealised.filter(i => i?.item?.item_class != "Prestation")

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

    let attachment_date = new Date(attachment?.attachmentDate)
    let attachment_date_to_string = attachment_date.getDay() + "/" + attachment_date.getMonth() + "/" + attachment_date.getFullYear()

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
        text: "Attachement journalier N°: " + attachment?.code,
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
              [{ text: 'Code BC: ', bold: true , margin: [0, 0, 0, 5] }],
              [{ text: 'Entreprise: Code CPM:', bold: true, margin: [0, 0, 0, 5]  }],
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
    text: 'Date et Signature chef de projet',
    style: 'sign_responsable'
  },
    {
      text: 'Date et Signature representant l’entreprise',
      style: 'sign_gerant'
    },
    {
      text: 'Date et Signature Responsable de travaux',
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


  GlobalAttDialog = false
  openGAdialog(){
    this.GlobalAttDialog = true
  }

  globalAttachmentCode: number
  startDateGA: Date
  endtDateGA: Date
  generateGlobal() {
    var img = logo
    if(this.market?.organization?.image != null){
      img = 'data:image/png;base64,'+this.market?.organization?.image?.data;
    }

    // values
    let items_prestation: ItemRealised[] = []
    let items_materiel: ItemRealised[] = []
    let filterAtt: Attachment[] = []

    // filter the attachment list
    filterAtt = this.attachments.filter(item => {
      const itemDate = new Date(item.attachmentDate);
      const start = new Date(this.startDateGA);
      const end = new Date(this.endtDateGA);

      return itemDate >= start && itemDate <= end;
    })

    filterAtt.map(attachment => {
      attachment?.itemsRealised.map(i => i.price = this.order?.itemsUsed.find(j => j?.item?.id == i?.item.id)?.price)

      items_prestation = items_prestation.concat(attachment?.itemsRealised.filter(i => i?.item?.item_class == "Prestation"))
      items_materiel = items_materiel.concat(attachment?.itemsRealised.filter(i => i?.item?.item_class != "Prestation"))
    })

    let mt_prestation = 0
    items_prestation.map(i => mt_prestation = mt_prestation + (i?.price * i?.quantity))

    let mt_materiel = 0
    items_materiel.map(i => mt_materiel = mt_materiel + (i?.price * i?.quantity))

    let mt = mt_prestation + mt_materiel
    let mt_ttc = mt + Math.round(((mt*19)/100)).toFixed(2)

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
        text: "Attachement global N°: " + this.globalAttachmentCode,
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
              [{ text: 'Code BC: ', bold: true , margin: [0, 0, 0, 5] }],
              [{ text: 'Entreprise: Code CPM:', bold: true, margin: [0, 0, 0, 5]  }],
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
  }
    };

    this.GlobalAttDialog = false
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

clonedItems: { [s: string]: ItemRealised } = {};

onRowEditInit(item: ItemRealised) {
    this.clonedItems[item?.id as unknown as string] = { ...item };
}

onRowEditSave(itemRealised: ItemRealised) {
  console.log(itemRealised)
    if (itemRealised.quantity > 0) {
      this.itemsRealisedService.editItemRealised(itemRealised,this.attachment?.id).subscribe({
        next: (response: any) => {
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: "Article Modifié", life: 3000 });
          this.getItemsRealisedByAttachmentId(this.attachment?.id)
        },
        error: (e) => {
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Ajout échoué', life: 3000 });
        },
        complete: () => {
          if(this.attType == "mp"){
            this.executeSequenceMP();
          }

          if(this.attType == "mc"){
            this.executeSequenceMC();
          }
        }
      })
}
}
onRowEditCancel(item: ItemRealised, index: number) {
  this.order.itemsUsed[index] = this.clonedItems[item?.id as unknown as string];
    delete this.clonedItems[item?.id as unknown as string];
}
}
