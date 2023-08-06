import { WorkOrder } from 'src/app/models/WorkOrder';
import { PurchaseOrder } from 'src/app/models/PurchaseOrder';
import { ItemDelivered } from "./ItemDelivered";

export interface Delivery{

  id? : number;
  code? : string;
  creationDate? : Date;
  deliveryDate? : Date;
  amount? : number;
  itemsDelivered?: ItemDelivered[];
  purchaseOrder?: PurchaseOrder;
  workOrder?: WorkOrder;

}
