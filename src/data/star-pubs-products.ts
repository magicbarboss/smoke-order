import { Product } from "@/types/inventory";

export const starPubsProducts: Product[] = [
  // BOTTLED BEERS - LAGER
  {
    id: "heineken-330ml-24",
    name: "Heineken 330ml",
    category: "BOTTLED BEERS - LAGER",
    unit: "24-pack",
    costPerUnit: 32.40,
    stock: { bar: 2, cellar: 8, holding: 0 },
    reorderPoint: 5,
    supplierId: "star-pubs"
  },
  {
    id: "stella-artois-330ml-24",
    name: "Stella Artois 330ml",
    category: "BOTTLED BEERS - LAGER",
    unit: "24-pack",
    costPerUnit: 34.20,
    stock: { bar: 1, cellar: 6, holding: 0 },
    reorderPoint: 4,
    supplierId: "star-pubs"
  },
  {
    id: "amstel-330ml-24",
    name: "Amstel 330ml",
    category: "BOTTLED BEERS - LAGER",
    unit: "24-pack",
    costPerUnit: 30.60,
    stock: { bar: 0, cellar: 4, holding: 0 },
    reorderPoint: 3,
    supplierId: "star-pubs"
  },
  {
    id: "fosters-330ml-24",
    name: "Fosters 330ml",
    category: "BOTTLED BEERS - LAGER",
    unit: "24-pack",
    costPerUnit: 28.80,
    stock: { bar: 1, cellar: 5, holding: 0 },
    reorderPoint: 3,
    supplierId: "star-pubs"
  },

  // BOTTLED BEERS - BITTER  
  {
    id: "speckled-hen-500ml-8",
    name: "Speckled Hen 500ml",
    category: "BOTTLED BEERS - BITTER",
    unit: "8-pack",
    costPerUnit: 19.14,
    stock: { bar: 3, cellar: 12, holding: 0 },
    reorderPoint: 8,
    supplierId: "star-pubs"
  },
  {
    id: "london-pride-500ml-8",
    name: "London Pride 500ml",
    category: "BOTTLED BEERS - BITTER",
    unit: "8-pack",
    costPerUnit: 18.95,
    stock: { bar: 2, cellar: 8, holding: 0 },
    reorderPoint: 6,
    supplierId: "star-pubs"
  },
  {
    id: "bombardier-500ml-8",
    name: "Bombardier 500ml",
    category: "BOTTLED BEERS - BITTER",
    unit: "8-pack",
    costPerUnit: 17.80,
    stock: { bar: 1, cellar: 4, holding: 0 },
    reorderPoint: 4,
    supplierId: "star-pubs"
  },

  // BOTTLED BEERS - CRAFT
  {
    id: "birra-moretti-330ml-24",
    name: "Birra Moretti 330ml",
    category: "BOTTLED BEERS - CRAFT",
    unit: "24-pack",
    costPerUnit: 38.40,
    stock: { bar: 1, cellar: 3, holding: 0 },
    reorderPoint: 2,
    supplierId: "star-pubs"
  },
  {
    id: "desperados-330ml-24",
    name: "Desperados 330ml",
    category: "BOTTLED BEERS - CRAFT",
    unit: "24-pack",
    costPerUnit: 36.60,
    stock: { bar: 0, cellar: 2, holding: 0 },
    reorderPoint: 2,
    supplierId: "star-pubs"
  },
  {
    id: "sol-330ml-24",
    name: "Sol 330ml",
    category: "BOTTLED BEERS - CRAFT",
    unit: "24-pack",
    costPerUnit: 35.20,
    stock: { bar: 1, cellar: 4, holding: 0 },
    reorderPoint: 3,
    supplierId: "star-pubs"
  },

  // CIDERS
  {
    id: "strongbow-original-330ml-24",
    name: "Strongbow Original 330ml",
    category: "CIDERS",
    unit: "24-pack",
    costPerUnit: 31.20,
    stock: { bar: 2, cellar: 6, holding: 0 },
    reorderPoint: 4,
    supplierId: "star-pubs"
  },
  {
    id: "strongbow-dark-fruit-330ml-24",
    name: "Strongbow Dark Fruit 330ml",
    category: "CIDERS",
    unit: "24-pack",
    costPerUnit: 32.40,
    stock: { bar: 1, cellar: 3, holding: 0 },
    reorderPoint: 3,
    supplierId: "star-pubs"
  },
  {
    id: "bulmers-original-330ml-24",
    name: "Bulmers Original 330ml",
    category: "CIDERS",
    unit: "24-pack",
    costPerUnit: 33.60,
    stock: { bar: 0, cellar: 2, holding: 0 },
    reorderPoint: 2,
    supplierId: "star-pubs"
  },

  // ALES
  {
    id: "newcastle-brown-330ml-24",
    name: "Newcastle Brown Ale 330ml",
    category: "ALES",
    unit: "24-pack",
    costPerUnit: 29.40,
    stock: { bar: 1, cellar: 4, holding: 0 },
    reorderPoint: 3,
    supplierId: "star-pubs"
  },
  {
    id: "john-smiths-330ml-24",
    name: "John Smith's 330ml",
    category: "ALES",
    unit: "24-pack",
    costPerUnit: 27.60,
    stock: { bar: 2, cellar: 6, holding: 0 },
    reorderPoint: 4,
    supplierId: "star-pubs"
  },

  // MINERALS
  {
    id: "coca-cola-330ml-24",
    name: "Coca Cola 330ml",
    category: "MINERALS",
    unit: "24-pack",
    costPerUnit: 28.80,
    stock: { bar: 4, cellar: 12, holding: 0 },
    reorderPoint: 8,
    supplierId: "star-pubs"
  },
  {
    id: "diet-coke-330ml-24",
    name: "Diet Coke 330ml",
    category: "MINERALS",
    unit: "24-pack",
    costPerUnit: 28.80,
    stock: { bar: 3, cellar: 10, holding: 0 },
    reorderPoint: 6,
    supplierId: "star-pubs"
  },
  {
    id: "fanta-orange-330ml-24",
    name: "Fanta Orange 330ml",
    category: "MINERALS",
    unit: "24-pack",
    costPerUnit: 27.60,
    stock: { bar: 2, cellar: 8, holding: 0 },
    reorderPoint: 5,
    supplierId: "star-pubs"
  },
  {
    id: "sprite-330ml-24",
    name: "Sprite 330ml",
    category: "MINERALS",
    unit: "24-pack",
    costPerUnit: 27.60,
    stock: { bar: 2, cellar: 6, holding: 0 },
    reorderPoint: 4,
    supplierId: "star-pubs"
  },
  {
    id: "schweppes-tonic-200ml-24",
    name: "Schweppes Tonic Water 200ml",
    category: "MINERALS",
    unit: "24-pack",
    costPerUnit: 24.00,
    stock: { bar: 5, cellar: 15, holding: 0 },
    reorderPoint: 10,
    supplierId: "star-pubs"
  },
  {
    id: "schweppes-ginger-ale-200ml-24",
    name: "Schweppes Ginger Ale 200ml",
    category: "MINERALS",
    unit: "24-pack",
    costPerUnit: 24.00,
    stock: { bar: 2, cellar: 8, holding: 0 },
    reorderPoint: 6,
    supplierId: "star-pubs"
  }
];