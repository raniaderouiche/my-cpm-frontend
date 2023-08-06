import { Organization } from './Organization';
import { Attachment } from "./Attachment";
import { ItemUsed } from "./ItemUsed";
import { Market } from "./Market";
import { WorkOrder } from "./WorkOrder";

export interface PurchaseOrder{

    id? : number;

    code? : String;
    num? : String;
    region? : String;
    amount? : number;
    limit? : number;
    startDate? : Date;
    itemsUsed?:ItemUsed[];
    workOrders?:WorkOrder[];
    market?:Market;
    attachment?:Attachment[];
    type? : String;
    organization?: Organization;
    validationState? : String;
    rejectionMotive?: String;
}
