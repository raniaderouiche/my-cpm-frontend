import { Item } from "./Item";
import { WorkOrder } from "./WorkOrder";

export interface DefinitiveOrder{

    id? : number;

    quantity? : number;

    workOrder? : WorkOrder;
    item? : Item;

    price?:number;


}
