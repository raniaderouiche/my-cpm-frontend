import { PurchaseOrder } from './../../../models/PurchaseOrder';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Market } from 'src/app/models/Market';
import { MarketService } from 'src/app/services/market.service';
import { PurchaseOrderService } from 'src/app/services/purchaseOrder.service';
import { ItemService } from 'src/app/services/item.service';
import { Item } from 'src/app/models/Item';
import { currency_options,statusArray, type_options,regions_options, budget_options,purchase_order_types } from 'src/assets/data/Options';
import { logo } from 'src/assets/data/LogoPlaceholder';
import { ProfessionService } from 'src/app/services/profession.service';
import { Profession } from 'src/app/models/Profession';
import { BusinessSectorService } from 'src/app/services/business-sector.service';
import { BusinessSector } from 'src/app/models/BusinessSector';
import { ItemUsedService } from 'src/app/services/item-used.service';
import { ItemUsed } from 'src/app/models/ItemUsed';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CustomFile } from 'src/app/models/CustomFile';
import { DomSanitizer } from '@angular/platform-browser';
import { OrganizationService } from 'src/app/services/organization.service';
import { Organization } from 'src/app/models/Organization';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-market-details',
  templateUrl: './market-details.component.html',
  styleUrls: ['./market-details.component.scss'],
  providers: [MessageService],

})
export class MarketDetailsComponent implements OnInit {

  @ViewChild('op', { static: false }) model;

  market: Market = {};
  pathId: number;

  selectedOrders: any[];

  orderForm: FormGroup;

  orderDialog: boolean = false;

  order: PurchaseOrder

  deleteOrderDialog: boolean = false;
  deleteOrdersDialog: boolean = false;
  marketDialog: boolean = false;
  articlesDialog: boolean = false;
  deleteItemDialog: boolean = false;
  AddArticlesDialog: boolean = false;

  itemForm: FormGroup;
  items: Item[];
  item: Item

  detailsForm: FormGroup;
  usedItemForm: FormGroup;

  currency_options = currency_options;
  regions_options = regions_options;
  statusArray = statusArray;
  budget_options = budget_options;
  type_options = type_options;
  professions: Profession[] = [];
  sectors: BusinessSector[] = [];
  cols: { field: string; header: string; }[];

  selectedUnit: any;
  spentBudget: number;
  remainingBudget: number;

  budgetControl: boolean = false;

  usedItems: any[];
  statuses: any[];

  purchase_order_types = purchase_order_types;
  user_role: any;

  isResponsable : Boolean = false
  isChefProjet: Boolean = false

  organizations : Organization[] = [];
  selectedOrganization:Organization;

  constructor(private marketService: MarketService,
    private route: ActivatedRoute,
    private purchaseOrderService: PurchaseOrderService,
    private itemService: ItemService,
    private messageService: MessageService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private organizationService : OrganizationService,
    private authenticationService : AuthenticationService,
    private professionService: ProfessionService,
    private businessSectorService: BusinessSectorService,
    private itemUsedService: ItemUsedService,) { }


  ngOnInit(): void {

    // get id from route
    this.route.params.subscribe(params => {
      this.pathId = params['id'];
    });

    this.statuses = [
      {label: 'Valide', value: 'true'},
      {label: 'Invalide', value: 'false'}
  ]

    this.getMarket();
    this.getSectors();
    this.getItems();
    this.user_role = this.authenticationService.getUserRoleFromLocalCache()

    if(this.authenticationService.getUserRoleFromLocalCache()=="RESPONSABLE_TRAVAUX"){
      this.isResponsable = true
    }

    if(this.authenticationService.getUserRoleFromLocalCache()=="CHEF_PROJET"){
      this.isChefProjet = true
    }

    this.detailsForm = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('', [Validators.pattern("[A-Za-z1-9 _àâéêèëìïîôùçæœÀÂÉÊÈËÌÏÎÔÙÛÇÆŒ-]+"), Validators.required]),
      code: new FormControl('', [Validators.pattern("[A-Za-z1-9 _àâéêèëìïîôùçæœÀÂÉÊÈËÌÏÎÔÙÛÇÆŒ-]+"), Validators.required]),
      budget: new FormControl('', [Validators.required]),
      type: new FormControl('', [Validators.required]),
      unit: new FormControl('', [Validators.required]),
      amount: new FormControl('', [Validators.required]),
      limit: new FormControl('', [Validators.required]),
      profession: new FormControl('', [Validators.required]),
      selectedSector: new FormControl('', [Validators.required]),
    })

    this.orderForm = new FormGroup({
      id: new FormControl(''),
      code: new FormControl(''),
      num: new FormControl(''),
      region: new FormControl(''),
      startDate: new FormControl('', [Validators.required]),
      amount: new FormControl('', [Validators.required]),
      limit: new FormControl('', [Validators.required]),
      type: new FormControl('', [Validators.required]),
      validationState: new FormControl(''),
      motive: new FormControl(''),
    })

    this.itemForm = new FormGroup({
      id: new FormControl(''),
      quantity: new FormControl('', [Validators.required]),
      price: new FormControl('', [Validators.required]),
      item: new FormControl('', [Validators.required]),
    })

    this.usedItemForm = new FormGroup({
      quantity: new FormControl('', [Validators.required]),
      price: new FormControl('', [Validators.required]),
    })
  }

  getMarket() {
    this.marketService.getMarketById(this.pathId).subscribe({
      next: (response: Market) => {
        this.market = response;
        this.selectedUnit = this.market.unit;
        if(this.user_role == 'FINANCIER'){
          this.market.purchaseOrders = this.market.purchaseOrders.filter(i => i.validationState != "Invalide");
          console.log(this.market.purchaseOrders);
        }
      },
      error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement échoué', life: 3000 })
    })
  }

  getItems() {
    this.itemService.getItems().subscribe({
      next: (response: Item[]) => this.items = response,
      error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement échoué', life: 3000 }),
    })
  }

  getPurchaseOrderByID() {
    this.purchaseOrderService.getPurchaseOrderById(this.order?.id).subscribe({
      next: (response: PurchaseOrder) => {
        this.order = response
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Enregistrement échoué', life: 3000 });
      },
      complete: () => this.orderDialog = false
    })
  }

  getProfessionsBySector(id: number) {
    this.professionService.getProfessionBySector(id).subscribe({
      next: (response: Profession[]) => this.professions = response,
      error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement échoué', life: 3000 }),
    })
  }

  getSectors() {
    this.businessSectorService.getSectors().subscribe({
      next: (response: BusinessSector[]) => this.sectors = response,
      error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Chargement échoué', life: 3000 }),
    })
  }

  getOrganisations() {
    this.organizationService.getOrganizations().subscribe(
      (data) => {
        this.organizations = data;
        console.log(this.organizations);
      }
    );
  }

  getSeverity(status: string) {
    switch (status) {
        case 'Valide':
            return 'success';
        case 'Invalide':
            return 'warning';
        case 'Rejetée':
            return 'danger';
        case 'En attente':
            return 'info';
    }
    return null;
}

  saveOrder() {

    this.order = {
      'id': this.orderForm.get('id').value,
      'num': this.orderForm.get('num').value,
      'region': this.orderForm.get('region').value.name,
      'amount': this.orderForm.get('amount').value,
      'limit': this.orderForm.get('limit').value,
      'startDate': this.orderForm.get('startDate').value,
      'type': this.orderForm.get('type').value,
      'validationState' : this.orderForm.get('validationState').value?.name,
      'rejectionMotive': this.orderForm.get('motive').value,
      'organization': this.selectedOrganization
    }

    if(!this.editDialog){
      this.order.validationState = statusArray[0].name
    }else{
      this.order.validationState = this.orderForm.get('validationState').value.name
    }

    if(this.order.validationState != "Rejetée"){
      this.order.rejectionMotive = null
    }

    // if (this.order.amount > this.remainingBudget) {
    //   this.budgetControl = true;
    // } else {
    //   this.budgetControl = false;
    //   this.purchaseOrderService.savePurchaseOrder(this.order, this.market.id).subscribe({
    //     next: (response: any) => {
    //       this.orderForm.reset();
    //       this.messageService.add({ severity: 'success', summary: 'Succès', detail: "Bon de Commande Enregistré", life: 3000 });
    //       this.getMarket();
    //     },
    //     error: (e) => {
    //       this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Enregistrement échoué', life: 3000 });
    //     },
    //     complete: () => this.orderDialog = false
    //   })
    // }

    this.purchaseOrderService.savePurchaseOrder(this.order, this.market.id).subscribe({
      next: (response: any) => {
        this.orderForm.reset();
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: "Bon de Commande Enregistré", life: 3000 });
        this.getMarket();
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Enregistrement échoué', life: 3000 });
      },
      complete: () => {
        this.orderDialog = false
        this.editDialog = false
      }
    })
  }

  confirmDelete() {
    this.deleteOrderDialog = false;

    this.purchaseOrderService.deletePurchaseOrder(this.order.id).subscribe({
      next: (v) => this.getMarket(),
      error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Suppréssion Echouée', life: 3000 }),
    })

    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Bon de Commande a été Supprimés', life: 3000 });
    this.order = {};
  }

  confirmDeleteSelected() {
    this.deleteOrdersDialog = false;
    for (let s of this.selectedOrders) {
      this.purchaseOrderService.deletePurchaseOrder(s.id).subscribe({
        next: (v) => this.getMarket(),
        error: (e) => this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Suppréssion Echouée', life: 3000 }),
      })
    }

    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Les Bons de Commande sélectionnés ont été supprimés', life: 3000 });
    this.selectedOrders = null;
  }

  openNew() {
    this.getOrganisations();
    this.orderForm.reset();
    this.editDialog = false
    this.orderDialog = true;
  }

  getObjectFromListByName(list,name): any{
    for (const item of list) {
      if (item.name === name) {
        return item;
      }
    }
    return null;
  }

  editDialog = false; // test if the dialog is for editing
  editPurchaseOrder(order: PurchaseOrder) {
    this.getOrganisations();
    let region = this.getObjectFromListByName(regions_options,order.region)
    let status = this.getObjectFromListByName(statusArray,order.validationState)
    this.editDialog = true
    this.orderForm.reset()
    this.order = { ...order };
    this.orderForm.get('id').setValue(order.id)
    this.orderForm.get('num').setValue(order.num)
    this.orderForm.get('region').setValue(region)
    this.orderForm.get('code').setValue(order.code)
    this.orderForm.get('amount').setValue(order.amount)
    this.orderForm.get('validationState').setValue(status)
    this.orderForm.get('limit').setValue(order.limit)
    this.orderForm.get('type').setValue(order.type)
    this.orderForm.get('motive').setValue(order.rejectionMotive)
    this.orderForm.get('startDate').setValue(new Date(order.startDate))
    this.remainingBudget = this.getRemainedBudget() + order.amount
    this.orderDialog = true;
  }

  hideOrderDialog() {
    this.orderDialog = false;
  }

  deletePurchaseOrder(order: PurchaseOrder) {
    this.deleteOrderDialog = true;
    this.order = { ...order };
  }

  deletePurchaseOrders() {
    this.deleteOrdersDialog = true;
  }

  openArticles(order: PurchaseOrder) {
    this.order = { ...order };
    this.itemForm.reset();
    this.usedItemForm.reset();
    this.getItems()
    this.articlesDialog = true;
  }

  openEditMarket() {
    console.log(this.market)
    this.detailsForm.get('id').setValue(this.market.id)
    this.detailsForm.get('name').setValue(this.market.name)
    this.detailsForm.get('code').setValue(this.market.code)
    this.detailsForm.get('budget').setValue(this.market.budget)
    this.detailsForm.get('type').setValue(this.market.type)
    this.detailsForm.get('unit').setValue(this.market.unit)
    this.detailsForm.get('amount').setValue(this.market.amount)
    this.detailsForm.get('limit').setValue(this.market.limit)
    this.detailsForm.get('selectedSector').setValue(this.market.profession.sector)
    this.onSectorSelect()
    this.detailsForm.get('profession').setValue(this.market.profession)

    this.marketDialog = true;
    this.getSectors();
    console.log(this.detailsForm.get('unit').value)
  }

  hideMarketDialog() {
    this.marketDialog = false;
  }

  editMarket() {

    let market = {
      'id': this.detailsForm.get('id').value,
      'name': this.detailsForm.get('name').value,
      'code': this.detailsForm.get('code').value,
      'budget': this.detailsForm.get('budget').value,
      'type': this.detailsForm.get('type').value,
      'unit': this.detailsForm.get('unit').value,
      'amount': this.detailsForm.get('amount').value,
      'limit': this.detailsForm.get('limit').value,
      'profession': this.detailsForm.get('profession').value,
      'organization': this.market.organization,
    }
    console.log(market)

    this.marketService.saveMarket(market).subscribe({
      next: (response: Market) => {
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: "Marché Modifié", life: 3000 });
        this.getMarket();
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Modification échouée', life: 3000 });
      },
      complete: () => this.marketDialog = false
    })
  }

  onSectorSelect() {
    if (this.detailsForm.get('selectedSector').value) {
      this.getProfessionsBySector(this.detailsForm.get('selectedSector').value.id)
    } else {
      this.professions = []
    }
  }


  onChangerCurrency() {
    this.selectedUnit = this.detailsForm.get('unit').value
  }

  //count remained budget
  getRemainedBudget() {
    this.spentBudget = 0;
    if (this.market?.purchaseOrders != null) {
      for (let order of this.market?.purchaseOrders) {
        this.spentBudget += order.amount
      }
    }
    return this.market?.amount - this.spentBudget
  }

  getSpentBudget(): number{
    return this.market?.purchaseOrders.reduce((total, order) => total + order?.amount, 0);
  }

  //count used budget in percentage
  getUsedBudget() {
    this.spentBudget = this.market?.amount - this.getRemainedBudget();
    // return (this.spendedBudget/this.market.amount)*100
    return Math.round((this.spentBudget / this.market?.amount) * 100) + "%"
  }

  openOverlayPanel() {
    this.usedItemForm.reset();
  }

  submitUsedItem(item: Item) {

    let itemUsed: ItemUsed = {
      'id': null,
      'item': item,
      'quantity': this.usedItemForm.get('quantity').value,
      'price': this.usedItemForm.get('price').value,
    }
    if(this.usedItemForm.valid){
      this.itemUsedService.saveItemUsed(this.order.id, itemUsed).subscribe({
        next: (response: ItemUsed) => {
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: "Article Ajouté", life: 3000 });
          this.getPurchaseOrderByID()
          this.getMarket();
          this.model.hide();
          this.usedItemForm.reset();
        },
        error: (e) => {
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Ajout échoué', life: 3000 });
        },
        //complete: () => this.overlayPanel = false
      })
    }
    else{
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Ajout échoué', life: 3000 });
    }

  }

  getItemsUsed() {
    this.itemUsedService.getItemUsedByPurchaseOrder(this.order.id).subscribe({
      next: (response: ItemUsed[]) => {
        this.usedItems = response
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Récupération échouée', life: 3000 });
      },
      // complete: () => this.overlayPanel = false
    })
  }

  deleteItemUsed() {
    this.itemUsedService.deleteItemUsed(this.item.id).subscribe({
      next: (response: ItemUsed) => {
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: "Article Supprimé", life: 3000 });
        this.getPurchaseOrderByID()
        this.getMarket();
        this.deleteItemDialog = false
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Suppression échouée', life: 3000 });
      },
      // complete: () => this.overlayPanel = false
    })
  }

  openDeleteItemDialog(item: Item) {
    this.item = item
    this.deleteItemDialog = true
  }

  openAddArticleDialog() {
    this.AddArticlesDialog = true
  }

  viewAttachment(order) {
    this.router.navigate(['cpm/attachment/order/', order.id]);
  }

  viewWorkOrder(order) {
    this.router.navigate(['cpm/workorder/order/', order.id]);
  }

  getSrcFromCustomFile(customFile : CustomFile){
    let uint8Array = new Uint8Array(atob(customFile.data).split("").map(char => char.charCodeAt(0)));
    let dwn = new Blob([uint8Array])
    return this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(dwn));
  }

  // ------------------BC pdf-------------------

  generatePDF(purchaseOrder: PurchaseOrder) {

    console.log(purchaseOrder?.organization)
    // values
    let items_prestation: ItemUsed[] = []
    let items_materiel: ItemUsed[] = []

    items_prestation = purchaseOrder?.itemsUsed.filter(i => i?.item?.item_class == "Prestation")
    items_materiel = purchaseOrder?.itemsUsed.filter(i => i?.item?.item_class != "Prestation")

    var img = logo
    if(this.market?.organization?.image != null){
      img = 'data:image/png;base64,'+this.market?.organization?.image?.data;
    }

    let start_date = new Date(purchaseOrder?.startDate)

    let mt_prestation = 0
    items_prestation.map(i => mt_prestation = mt_prestation + (i?.price * i?.quantity))

    let mt_materiel = 0
    items_materiel.map(i => mt_materiel = mt_materiel + (i?.price * i?.quantity))

    let mt = mt_prestation + mt_materiel
    let mt_ttc = mt + ((mt*19)/100)
    // ----- mise en page -----

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
          text: "Bon de Commande N°: " + purchaseOrder?.code,
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
                [{ text: 'Entreprise: Code CPM: ', bold: true , margin: [0, 0, 0, 5] }],
                [{ text: 'Montant en ' + this.market?.unit + ': ', bold: true, margin: [0, 0, 0, 5]  }],
                [{ text: 'Delais en jours: ', bold: true, margin: [0, 0, 0, 5]  }],
                // You can add more text elements here
              ],
            },
            {
              width: '*',
              stack: [
                [{ text: this.market?.code , margin: [0, 0, 0, 5] }],
                [{ text: this.market?.name , margin: [0, 0, 0, 5] }],
                [{ text: purchaseOrder?.organization?.code , margin: [0, 0, 0, 5] }],
                [{ text: purchaseOrder?.amount , margin: [0, 0, 0, 5] }],
                [{ text: purchaseOrder?.limit , margin: [0, 0, 0, 5] }],
                // You can add more text elements here
              ],
              style: 'columnStyle'
            },
            {
              width: 'auto',
              stack: [
                [{ text: ' ', bold: true }],
                [{ text: 'Type projet:', bold: true , margin: [0, 0, 0, 5] }],
                [{ text: 'Entreprise:', bold: true , margin: [0, 0, 0, 5] }],
              ],
              style: 'columnStyle'
            },
            {
              width: 'auto',
              stack: [
                [{ text: ' ', bold: true }],
                [{ text: this.market?.type , margin: [0, 0, 0, 5] }],
                [{ text: purchaseOrder?.organization?.name, margin: [0, 0, 0, 5]}],
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
          text: 'Date et Signature Gérant de l"Organisation',
          style: 'sign_gerant'
        },
        {
          text: 'Date et Signature Responsable Financier',
          style: 'sign_responsable',
          margin: [0, 25, 0, 0],
        },
        {
          text: 'Date et Signature Gérant de l"Entreprise',
          style: 'sign_gerant',
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



clonedItems: { [s: string]: ItemUsed } = {};

onRowEditInit(item: ItemUsed) {
    this.clonedItems[item?.id as unknown as string] = { ...item };
}

onRowEditSave(item: ItemUsed) {
    if (item.price > 0) {
      console.log(item)
      this.itemUsedService.editItemUsed(this.order.id,item).subscribe({
        next: (response: ItemUsed) => {
          this.messageService.add({ severity: 'success', summary: 'Succès', detail: "Article Modifié", life: 3000 });
          this.getPurchaseOrderByID()
          this.getMarket();
        },
        error: (e) => {
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Modification échoué', life: 3000 });
        },
      })
    } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Prix Invalide' });
    }
}

onRowEditCancel(item: ItemUsed, index: number) {
  this.order.itemsUsed[index] = this.clonedItems[item?.id as unknown as string];
    delete this.clonedItems[item?.id as unknown as string];
}

getTotal(order): number {
  return order?.itemsUsed.reduce((total, item) => total + item.price * item.quantity, 0);
}

getTotalBC(): number {
  return this.market?.purchaseOrders.reduce((total, item) => total + this.getTotal(item), 0);
}

getLeftoverItemsAmount():number{
  //return this.market?.amount - this.getTotalBC();
  return this.order.amount - this.getTotal(this.order)
}

getItemsPercentage(){
  return Math.round((this.getTotal(this.order) / this.order.amount) * 100) + "%"
}

}
