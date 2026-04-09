import { graphicDesignItem } from "./documents/graphic-design-item";
import { officeRecItem } from "./documents/office-rec-item";
import { producedWorkItem } from "./documents/produced-work-item";
import { workCreditLine } from "./objects/work-credit-line";
import { workItem } from "./objects/work-item";

export const schemaTypes = [
  workCreditLine,
  workItem,
  officeRecItem,
  graphicDesignItem,
  producedWorkItem,
];
