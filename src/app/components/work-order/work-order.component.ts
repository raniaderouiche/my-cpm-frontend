import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PurchaseOrder } from 'src/app/models/PurchaseOrder';
import { WorkOrder } from 'src/app/models/WorkOrder';
import { PurchaseOrderService } from 'src/app/services/purchaseOrder.service';
import { WorkOrderService } from 'src/app/services/work-order.service';

@Component({
  selector: 'app-work-order',
  templateUrl: './work-order.component.html',
  styleUrls: ['./work-order.component.scss'],
  providers: [MessageService]
})
export class WorkOrderComponent implements OnInit {

  myForm: FormGroup;
  workOrderDialog: boolean;
  deleteWorkOrderDialog: boolean = false;
  deleteWorkOrdersDialog: boolean = false;
  selectedWorkOrders: WorkOrder[];
  workOrder : WorkOrder;
  workOrders : WorkOrder[];
  order: PurchaseOrder;
  pathId: number;


  constructor(
    private workOrderService: WorkOrderService,
    private purchaseOrderService : PurchaseOrderService,
    private messageService: MessageService,
    private route : ActivatedRoute,) { }

  ngOnInit(): void {

  }


}
