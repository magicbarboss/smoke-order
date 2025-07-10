import { Supplier } from "@/types/inventory";

export const suppliers: Supplier[] = [
  {
    id: "star-pubs",
    name: "Star Pubs-Heineken",
    account: "525701",
    deadline: "Thursday 4pm",
    deliveryWindow: "Monday 10am-2pm",
    hasVAT: true
  },
  {
    id: "st-austell",
    name: "St Austell",
    account: "764145",
    deadline: "Sunday 12pm",
    deliveryWindow: "Monday 10am-2pm",
    hasVAT: true
  },
  {
    id: "salvo-charles",
    name: "Salvo & Charles Saunders",
    account: "N/A",
    deadline: "Sunday 12pm",
    deliveryWindow: "Monday 10am-2pm",
    hasVAT: true
  },
  {
    id: "cormack",
    name: "Cormack Commercial",
    account: "N/A",
    deadline: "Flexible",
    deliveryWindow: "Varies",
    hasVAT: true
  },
  {
    id: "masterclass",
    name: "Internal Masterclass",
    account: "Internal",
    deadline: "As needed",
    deliveryWindow: "Internal",
    hasVAT: false
  }
];