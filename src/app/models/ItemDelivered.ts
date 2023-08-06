import { Delivery } from "./Delivery";
import { Item } from "./Item";

export interface ItemDelivered{
  id?: number;
  quantity? : number;
  price? : number;
  item? : Item;
  delivery?:Delivery;
}
