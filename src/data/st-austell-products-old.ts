import { Product } from "@/types/inventory";

export const stAustellProducts: Product[] = [
  // SPIRITS - WHISKIES
  {
    id: "jameson",
    name: "Jameson Irish Whiskey",
    category: "SPIRITS - WHISKIES",
    unit: "bottle",
    costPerUnit: 21.79,
    stock: { bar: 0.3, cellar: 1.7, holding: 0 },
    reorderPoint: 1.0,
    supplierId: "st-austell"
  },
  {
    id: "jim-beam",
    name: "Jim Beam Bourbon",
    category: "SPIRITS - WHISKIES",
    unit: "bottle",
    costPerUnit: 24.39,
    stock: { bar: 0.5, cellar: 0.8, holding: 0 },
    reorderPoint: 1.0,
    supplierId: "st-austell"
  },
  {
    id: "jack-honey",
    name: "Jack Daniel's Honey",
    category: "Whiskey",
    unit: "bottle",
    costPerUnit: 22.49,
    stock: { bar: 0.2, cellar: 1.1, holding: 0 },
    reorderPoint: 1.0,
    supplierId: "st-austell"
  },
  {
    id: "johnnie-walker-black",
    name: "Johnnie Walker Black",
    category: "Whiskey",
    unit: "bottle",
    costPerUnit: 19.99,
    stock: { bar: 0.7, cellar: 1.3, holding: 0 },
    reorderPoint: 1.0,
    supplierId: "st-austell"
  },
  {
    id: "haig-club",
    name: "Haig Club",
    category: "Whiskey",
    unit: "bottle",
    costPerUnit: 27.09,
    stock: { bar: 0.1, cellar: 0.4, holding: 0 },
    reorderPoint: 0.5,
    supplierId: "st-austell"
  },
  {
    id: "bushmills",
    name: "Bushmills",
    category: "Whiskey",
    unit: "bottle",
    costPerUnit: 21.39,
    stock: { bar: 0.6, cellar: 0.9, holding: 0 },
    reorderPoint: 1.0,
    supplierId: "st-austell"
  },
  {
    id: "glenmorangie",
    name: "Glenmorangie",
    category: "Whiskey",
    unit: "bottle",
    costPerUnit: 39.09,
    stock: { bar: 0.2, cellar: 0.3, holding: 0 },
    reorderPoint: 0.5,
    supplierId: "st-austell"
  },
  {
    id: "grouse",
    name: "Grouse",
    category: "Whiskey",
    unit: "bottle",
    costPerUnit: 15.29,
    stock: { bar: 0.8, cellar: 1.4, holding: 0 },
    reorderPoint: 1.0,
    supplierId: "st-austell"
  },
  {
    id: "jack-daniels",
    name: "Jack Daniels",
    category: "Whiskey",
    unit: "bottle",
    costPerUnit: 21.79,
    stock: { bar: 0.4, cellar: 1.6, holding: 0 },
    reorderPoint: 1.0,
    supplierId: "st-austell"
  },
  {
    id: "southern-comfort",
    name: "Southern Comfort",
    category: "Whiskey",
    unit: "bottle",
    costPerUnit: 23.19,
    stock: { bar: 0.3, cellar: 0.7, holding: 0 },
    reorderPoint: 1.0,
    supplierId: "st-austell"
  },

  // GIN
  {
    id: "tanqueray",
    name: "Tanqueray",
    category: "SPIRITS - GIN",
    unit: "bottle",
    costPerUnit: 25.30,
    stock: { bar: 0.5, cellar: 1.2, holding: 0 },
    reorderPoint: 1.0,
    supplierId: "st-austell"
  },
  {
    id: "tanq-savilla",
    name: "Tanq Savilla",
    category: "Gin",
    unit: "bottle",
    costPerUnit: 26.19,
    stock: { bar: 0.3, cellar: 0.8, holding: 0 },
    reorderPoint: 0.5,
    supplierId: "st-austell"
  },
  {
    id: "tanq-savilla-0",
    name: "Tanq Savilla 0%",
    category: "Gin",
    unit: "bottle",
    costPerUnit: 14.99,
    stock: { bar: 0.2, cellar: 0.6, holding: 0 },
    reorderPoint: 0.5,
    supplierId: "st-austell"
  },
  {
    id: "tanqueray-0",
    name: "Tanqueray 0%",
    category: "Gin",
    unit: "bottle",
    costPerUnit: 16.65,
    stock: { bar: 0.1, cellar: 0.4, holding: 0 },
    reorderPoint: 0.5,
    supplierId: "st-austell"
  },
  {
    id: "gordons-pink",
    name: "Gordons Pink",
    category: "Gin",
    unit: "bottle",
    costPerUnit: 15.49,
    stock: { bar: 0.7, cellar: 1.3, holding: 0 },
    reorderPoint: 1.0,
    supplierId: "st-austell"
  },
  {
    id: "whitley-gin-rhub-ging",
    name: "Whitley Gin Rhub & Ging",
    category: "Gin",
    unit: "bottle",
    costPerUnit: 21.99,
    stock: { bar: 0.2, cellar: 0.5, holding: 0 },
    reorderPoint: 0.5,
    supplierId: "st-austell"
  },
  {
    id: "whitley-gin-raspberry",
    name: "Whitley Gin Raspberry",
    category: "Gin",
    unit: "bottle",
    costPerUnit: 21.99,
    stock: { bar: 0.3, cellar: 0.6, holding: 0 },
    reorderPoint: 0.5,
    supplierId: "st-austell"
  },
  {
    id: "whitley-gin-orange",
    name: "Whitley Gin Orange",
    category: "Gin",
    unit: "bottle",
    costPerUnit: 20.99,
    stock: { bar: 0.1, cellar: 0.4, holding: 0 },
    reorderPoint: 0.5,
    supplierId: "st-austell"
  },
  {
    id: "bombay-gin",
    name: "Bombay Gin",
    category: "Gin",
    unit: "bottle",
    costPerUnit: 20.29,
    stock: { bar: 0.6, cellar: 1.1, holding: 0 },
    reorderPoint: 1.0,
    supplierId: "st-austell"
  },
  {
    id: "hendricks-gin",
    name: "Hendricks Gin",
    category: "Gin",
    unit: "bottle",
    costPerUnit: 29.39,
    stock: { bar: 0.4, cellar: 0.7, holding: 0 },
    reorderPoint: 0.5,
    supplierId: "st-austell"
  },
  {
    id: "77-dark-fruits",
    name: "77 Dark Fruits",
    category: "Gin",
    unit: "bottle",
    costPerUnit: 17.99,
    stock: { bar: 0.8, cellar: 1.5, holding: 0 },
    reorderPoint: 1.0,
    supplierId: "st-austell"
  },
  {
    id: "77-passionfruit",
    name: "77 Passionfruit",
    category: "Gin",
    unit: "bottle",
    costPerUnit: 17.99,
    stock: { bar: 0.5, cellar: 1.2, holding: 0 },
    reorderPoint: 1.0,
    supplierId: "st-austell"
  },
  {
    id: "77-peach",
    name: "77 Peach",
    category: "Gin",
    unit: "bottle",
    costPerUnit: 17.99,
    stock: { bar: 0.3, cellar: 0.9, holding: 0 },
    reorderPoint: 0.5,
    supplierId: "st-austell"
  },

  // RUM
  {
    id: "dmf-finger-spiced-rum",
    name: "DMF Finger Spiced Rum",
    category: "SPIRITS - RUMS",
    unit: "bottle",
    costPerUnit: 18.59,
    stock: { bar: 0.6, cellar: 1.1, holding: 0 },
    reorderPoint: 1.0,
    supplierId: "st-austell"
  },
  {
    id: "dmf-cherry",
    name: "DMF Cherry",
    category: "Rum",
    unit: "bottle",
    costPerUnit: 18.09,
    stock: { bar: 0.4, cellar: 0.8, holding: 0 },
    reorderPoint: 0.5,
    supplierId: "st-austell"
  },
  {
    id: "dmf-finger-coconut",
    name: "DMF Finger Coconut",
    category: "Rum",
    unit: "bottle",
    costPerUnit: 17.29,
    stock: { bar: 0.3, cellar: 0.7, holding: 0 },
    reorderPoint: 0.5,
    supplierId: "st-austell"
  },
  {
    id: "dmf-spiced-0",
    name: "DMF Spiced 0%",
    category: "Rum",
    unit: "bottle",
    costPerUnit: 14.79,
    stock: { bar: 0.2, cellar: 0.5, holding: 0 },
    reorderPoint: 0.5,
    supplierId: "st-austell"
  },
  {
    id: "mount-gay",
    name: "Mount Gay",
    category: "Rum",
    unit: "bottle",
    costPerUnit: 20.59,
    stock: { bar: 0.5, cellar: 0.9, holding: 0 },
    reorderPoint: 1.0,
    supplierId: "st-austell"
  },
  {
    id: "kraken-rum",
    name: "Kraken Rum",
    category: "Rum",
    unit: "bottle",
    costPerUnit: 23.49,
    stock: { bar: 0.7, cellar: 1.3, holding: 0 },
    reorderPoint: 1.0,
    supplierId: "st-austell"
  },
  {
    id: "morgans-spiced",
    name: "Morgans Spiced",
    category: "Rum",
    unit: "bottle",
    costPerUnit: 14.49,
    stock: { bar: 0.8, cellar: 1.6, holding: 0 },
    reorderPoint: 1.0,
    supplierId: "st-austell"
  },
  {
    id: "morgans-rum",
    name: "Morgans Rum",
    category: "Rum",
    unit: "bottle",
    costPerUnit: 16.19,
    stock: { bar: 0.4, cellar: 1.1, holding: 0 },
    reorderPoint: 1.0,
    supplierId: "st-austell"
  },
  {
    id: "sailor-jerrys",
    name: "Sailor Jerrys",
    category: "Rum",
    unit: "bottle",
    costPerUnit: 24.59,
    stock: { bar: 0.6, cellar: 1.0, holding: 0 },
    reorderPoint: 1.0,
    supplierId: "st-austell"
  },

  // VODKA
  {
    id: "smirnoff-red",
    name: "Smirnoff Red",
    category: "SPIRITS - VODKA",
    unit: "bottle",
    costPerUnit: 14.69,
    stock: { bar: 0.9, cellar: 2.1, holding: 0 },
    reorderPoint: 1.5,
    supplierId: "st-austell"
  },
  {
    id: "absolute-citron",
    name: "Absolute Citron",
    category: "Vodka",
    unit: "bottle",
    costPerUnit: 0.00, // Price not specified in list
    stock: { bar: 0.1, cellar: 0.2, holding: 0 },
    reorderPoint: 0.5,
    supplierId: "st-austell"
  },

  // COCKTAILS
  {
    id: "tia-maria",
    name: "Tia Maria",
    category: "SPIRITS - LIQUEURS",
    unit: "bottle",
    costPerUnit: 16.69,
    stock: { bar: 0.4, cellar: 0.8, holding: 0 },
    reorderPoint: 0.5,
    supplierId: "st-austell"
  },
  {
    id: "77black",
    name: "77Black",
    category: "Cocktails",
    unit: "bottle",
    costPerUnit: 18.50,
    stock: { bar: 0.3, cellar: 0.6, holding: 0 },
    reorderPoint: 0.5,
    supplierId: "st-austell"
  },
  {
    id: "ron-calados-white-rum",
    name: "Ron Calados White Rum",
    category: "Cocktails",
    unit: "bottle",
    costPerUnit: 13.09,
    stock: { bar: 0.5, cellar: 1.0, holding: 0 },
    reorderPoint: 0.5,
    supplierId: "st-austell"
  },
  {
    id: "archers-peach",
    name: "Archers Peach",
    category: "Cocktails",
    unit: "bottle",
    costPerUnit: 13.49,
    stock: { bar: 0.7, cellar: 1.3, holding: 0 },
    reorderPoint: 1.0,
    supplierId: "st-austell"
  },
  {
    id: "beefeater-pink-gin",
    name: "Beefeater Pink Gin",
    category: "Cocktails",
    unit: "bottle",
    costPerUnit: 17.69,
    stock: { bar: 0.2, cellar: 0.5, holding: 0 },
    reorderPoint: 0.5,
    supplierId: "st-austell"
  },
  {
    id: "bol-curacao",
    name: "Bol Curacao",
    category: "Cocktails",
    unit: "bottle",
    costPerUnit: 13.79,
    stock: { bar: 0.1, cellar: 0.4, holding: 0 },
    reorderPoint: 0.5,
    supplierId: "st-austell"
  },
  {
    id: "bristol-grenadine",
    name: "Bristol Grenadine",
    category: "Cocktails",
    unit: "bottle",
    costPerUnit: 8.08,
    stock: { bar: 0.6, cellar: 1.2, holding: 0 },
    reorderPoint: 1.0,
    supplierId: "st-austell"
  },
  {
    id: "bristol-sugar-syrup",
    name: "Bristol Sugar Syrup",
    category: "Cocktails",
    unit: "bottle",
    costPerUnit: 5.19,
    stock: { bar: 0.8, cellar: 1.5, holding: 0 },
    reorderPoint: 1.0,
    supplierId: "st-austell"
  },

  // SHOOTERS
  {
    id: "tequila-rose",
    name: "Tequila Rose",
    category: "Shooters",
    unit: "bottle",
    costPerUnit: 18.09,
    stock: { bar: 0.5, cellar: 0.9, holding: 0 },
    reorderPoint: 0.5,
    supplierId: "st-austell"
  },
  {
    id: "dr-hydes-jaeger",
    name: "Dr Hydes/Jaeger",
    category: "Shooters",
    unit: "bottle",
    costPerUnit: 17.49,
    stock: { bar: 0.3, cellar: 0.7, holding: 0 },
    reorderPoint: 0.5,
    supplierId: "st-austell"
  },
  {
    id: "dmf-raspberry-liqueur",
    name: "DMF Raspberry Liqueur",
    category: "Shooters",
    unit: "bottle",
    costPerUnit: 11.79,
    stock: { bar: 0.2, cellar: 0.5, holding: 0 },
    reorderPoint: 0.5,
    supplierId: "st-austell"
  },
  {
    id: "jose-cuervo-white-teq",
    name: "Jose Cuervo White Teq",
    category: "Shooters",
    unit: "bottle",
    costPerUnit: 21.39,
    stock: { bar: 0.4, cellar: 0.8, holding: 0 },
    reorderPoint: 0.5,
    supplierId: "st-austell"
  },
  {
    id: "jose-cuervo-gold-teq",
    name: "Jose Cuervo Gold Teq",
    category: "Shooters",
    unit: "bottle",
    costPerUnit: 20.59,
    stock: { bar: 0.6, cellar: 1.0, holding: 0 },
    reorderPoint: 0.5,
    supplierId: "st-austell"
  },
  {
    id: "luxardo-sambuca",
    name: "Luxardo Sambuca",
    category: "Shooters",
    unit: "bottle",
    costPerUnit: 16.29,
    stock: { bar: 0.3, cellar: 0.6, holding: 0 },
    reorderPoint: 0.5,
    supplierId: "st-austell"
  },
  {
    id: "luxardo-black-sambuca",
    name: "Luxardo Black Sambuca",
    category: "Shooters",
    unit: "bottle",
    costPerUnit: 16.99,
    stock: { bar: 0.1, cellar: 0.3, holding: 0 },
    reorderPoint: 0.5,
    supplierId: "st-austell"
  },

  // SPIRITS MISC
  {
    id: "courvoisier",
    name: "Courvoisier",
    category: "Spirits Misc",
    unit: "bottle",
    costPerUnit: 25.79,
    stock: { bar: 0.2, cellar: 0.4, holding: 0 },
    reorderPoint: 0.5,
    supplierId: "st-austell"
  },
  {
    id: "cockburns",
    name: "Cockburns",
    category: "Spirits Misc",
    unit: "bottle",
    costPerUnit: 10.52,
    stock: { bar: 0.3, cellar: 0.7, holding: 0 },
    reorderPoint: 0.5,
    supplierId: "st-austell"
  },
  {
    id: "disaronno-amaretto",
    name: "Disaronno Amaretto",
    category: "Spirits Misc",
    unit: "bottle",
    costPerUnit: 19.39,
    stock: { bar: 0.5, cellar: 0.8, holding: 0 },
    reorderPoint: 0.5,
    supplierId: "st-austell"
  },
  {
    id: "malibu",
    name: "Malibu",
    category: "Spirits Misc",
    unit: "bottle",
    costPerUnit: 14.29,
    stock: { bar: 0.7, cellar: 1.3, holding: 0 },
    reorderPoint: 1.0,
    supplierId: "st-austell"
  },
  {
    id: "bacardi",
    name: "Bacardi",
    category: "Spirits Misc",
    unit: "bottle",
    costPerUnit: 17.69,
    stock: { bar: 0.8, cellar: 1.5, holding: 0 },
    reorderPoint: 1.0,
    supplierId: "st-austell"
  },
  {
    id: "baileys",
    name: "Baileys",
    category: "Spirits Misc",
    unit: "bottle",
    costPerUnit: 14.09,
    stock: { bar: 0.6, cellar: 1.2, holding: 0 },
    reorderPoint: 1.0,
    supplierId: "st-austell"
  },

  // RED WINES
  {
    id: "billycan-shiraz",
    name: "Billycan Shiraz",
    category: "Red Wine",
    unit: "bottle",
    costPerUnit: 7.21,
    stock: { bar: 2, cellar: 6, holding: 0 },
    reorderPoint: 4,
    supplierId: "st-austell"
  },
  {
    id: "alta-merlot",
    name: "Alta Merlot",
    category: "Red Wine",
    unit: "bottle",
    costPerUnit: 6.43,
    stock: { bar: 3, cellar: 8, holding: 0 },
    reorderPoint: 6,
    supplierId: "st-austell"
  },
  {
    id: "alta-cab-sauv",
    name: "Alta Cab Sauv",
    category: "Red Wine",
    unit: "bottle",
    costPerUnit: 6.43,
    stock: { bar: 1, cellar: 5, holding: 0 },
    reorderPoint: 4,
    supplierId: "st-austell"
  },

  // ROSE WINE
  {
    id: "tanti-pinot-rose",
    name: "Tanti Pinot Rose",
    category: "Rose Wine",
    unit: "bottle",
    costPerUnit: 6.20,
    stock: { bar: 2, cellar: 7, holding: 0 },
    reorderPoint: 5,
    supplierId: "st-austell"
  },
  {
    id: "falling-petal-rose",
    name: "Falling Petal Rose",
    category: "Rose Wine",
    unit: "bottle",
    costPerUnit: 6.63,
    stock: { bar: 1, cellar: 4, holding: 0 },
    reorderPoint: 3,
    supplierId: "st-austell"
  },

  // WHITE WINE
  {
    id: "arapala-sky-chardonnay",
    name: "Arapala Sky Chardonnay",
    category: "White Wine",
    unit: "bottle",
    costPerUnit: 5.82,
    stock: { bar: 3, cellar: 9, holding: 0 },
    reorderPoint: 6,
    supplierId: "st-austell"
  },
  {
    id: "frunza-pinot-grigio",
    name: "Frunza Pinot Grigio",
    category: "White Wine",
    unit: "bottle",
    costPerUnit: 6.30,
    stock: { bar: 2, cellar: 8, holding: 0 },
    reorderPoint: 5,
    supplierId: "st-austell"
  },
  {
    id: "sauv-blanc-rue-de-amis",
    name: "Sauv Blanc Rue de Amis",
    category: "White Wine",
    unit: "bottle",
    costPerUnit: 6.92,
    stock: { bar: 4, cellar: 10, holding: 0 },
    reorderPoint: 8,
    supplierId: "st-austell"
  },
  {
    id: "seafarer-sauv-blanc-nz",
    name: "Seafarer Sauv Blanc NZ",
    category: "White Wine",
    unit: "bottle",
    costPerUnit: 9.45,
    stock: { bar: 1, cellar: 5, holding: 0 },
    reorderPoint: 3,
    supplierId: "st-austell"
  },

  // BUBBLES DARLING
  {
    id: "pouring-prosecco",
    name: "Pouring Prosecco",
    category: "Bubbles",
    unit: "bottle",
    costPerUnit: 6.67,
    stock: { bar: 2, cellar: 8, holding: 0 },
    reorderPoint: 6,
    supplierId: "st-austell"
  },
  {
    id: "bottles-prosecco",
    name: "Bottles Prosecco",
    category: "Bubbles",
    unit: "bottle",
    costPerUnit: 7.77,
    stock: { bar: 1, cellar: 6, holding: 0 },
    reorderPoint: 4,
    supplierId: "st-austell"
  }
];