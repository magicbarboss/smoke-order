-- Insert St Austell products into products table
INSERT INTO public.products (id, name, category, unit, current_price, supplier_id, reorder_point) VALUES
-- WHISKEY
(gen_random_uuid(), 'Jameson', 'WHISKEY', 'bottle', 21.79, 'st-austell', 5),
(gen_random_uuid(), 'Jim Beam', 'WHISKEY', 'bottle', 24.39, 'st-austell', 5),
(gen_random_uuid(), 'Jack Honey', 'WHISKEY', 'bottle', 22.49, 'st-austell', 5),
(gen_random_uuid(), 'Johnnie Walker Black', 'WHISKEY', 'bottle', 19.99, 'st-austell', 5),
(gen_random_uuid(), 'Haig Club', 'WHISKEY', 'bottle', 27.09, 'st-austell', 5),
(gen_random_uuid(), 'Bushmills', 'WHISKEY', 'bottle', 21.39, 'st-austell', 5),
(gen_random_uuid(), 'Glenmorangie', 'WHISKEY', 'bottle', 39.09, 'st-austell', 3),
(gen_random_uuid(), 'Grouse', 'WHISKEY', 'bottle', 15.29, 'st-austell', 5),
(gen_random_uuid(), 'Jack Daniels', 'WHISKEY', 'bottle', 21.79, 'st-austell', 5),
(gen_random_uuid(), 'Southern Comfort', 'WHISKEY', 'bottle', 23.19, 'st-austell', 5),

-- GIN
(gen_random_uuid(), 'Tanqueray', 'GIN', 'bottle', 25.30, 'st-austell', 5),
(gen_random_uuid(), 'Tanq Savilla', 'GIN', 'bottle', 26.19, 'st-austell', 3),
(gen_random_uuid(), 'Tanq Savilla 0%', 'GIN', 'bottle', 14.99, 'st-austell', 3),
(gen_random_uuid(), 'Tanqueray 0%', 'GIN', 'bottle', 16.65, 'st-austell', 3),
(gen_random_uuid(), 'Gordons Pink', 'GIN', 'bottle', 15.49, 'st-austell', 5),
(gen_random_uuid(), 'Whitley Gin Rhub & Ging', 'GIN', 'bottle', 21.99, 'st-austell', 3),
(gen_random_uuid(), 'Whitley Gin Raspberry', 'GIN', 'bottle', 21.99, 'st-austell', 3),
(gen_random_uuid(), 'Whitley Gin Orange', 'GIN', 'bottle', 20.99, 'st-austell', 3),
(gen_random_uuid(), 'Bombay Gin', 'GIN', 'bottle', 20.29, 'st-austell', 5),
(gen_random_uuid(), 'Hendricks Gin', 'GIN', 'bottle', 29.39, 'st-austell', 3),
(gen_random_uuid(), '77 Dark Fruits', 'GIN', 'bottle', 17.99, 'st-austell', 3),
(gen_random_uuid(), '77 Passionfruit', 'GIN', 'bottle', 17.99, 'st-austell', 3),
(gen_random_uuid(), '77 Peach', 'GIN', 'bottle', 17.99, 'st-austell', 3),

-- RUM
(gen_random_uuid(), 'DMF Finger Spiced Rum', 'RUM', 'bottle', 18.59, 'st-austell', 5),
(gen_random_uuid(), 'DMF Cherry', 'RUM', 'bottle', 18.09, 'st-austell', 3),
(gen_random_uuid(), 'DMF Finger Coconut', 'RUM', 'bottle', 17.29, 'st-austell', 3),
(gen_random_uuid(), 'DMF Spiced 0%', 'RUM', 'bottle', 14.79, 'st-austell', 3),
(gen_random_uuid(), 'Mount Gay', 'RUM', 'bottle', 20.59, 'st-austell', 5),
(gen_random_uuid(), 'Kraken Rum', 'RUM', 'bottle', 23.49, 'st-austell', 3),
(gen_random_uuid(), 'Morgans Spiced', 'RUM', 'bottle', 14.49, 'st-austell', 5),
(gen_random_uuid(), 'Morgans Rum', 'RUM', 'bottle', 16.19, 'st-austell', 5),
(gen_random_uuid(), 'Sailor Jerrys', 'RUM', 'bottle', 24.59, 'st-austell', 3),

-- VODKA
(gen_random_uuid(), 'Smirnoff Red', 'VODKA', 'bottle', 14.69, 'st-austell', 5),
(gen_random_uuid(), 'Absolute Citron', 'VODKA', 'bottle', 0.00, 'st-austell', 0),

-- COCKTAILS
(gen_random_uuid(), 'Tia Maria', 'COCKTAILS', 'bottle', 16.69, 'st-austell', 3),
(gen_random_uuid(), '77Black', 'COCKTAILS', 'bottle', 18.50, 'st-austell', 3),
(gen_random_uuid(), 'Ron Calados White Rum', 'COCKTAILS', 'bottle', 13.09, 'st-austell', 3),
(gen_random_uuid(), 'Archers Peach', 'COCKTAILS', 'bottle', 13.49, 'st-austell', 3),
(gen_random_uuid(), 'Beefeater Pink Gin', 'COCKTAILS', 'bottle', 17.69, 'st-austell', 3),
(gen_random_uuid(), 'Bol Curacao', 'COCKTAILS', 'bottle', 13.79, 'st-austell', 3),
(gen_random_uuid(), 'Bristol Grenadine', 'COCKTAILS', 'bottle', 8.08, 'st-austell', 5),
(gen_random_uuid(), 'Bristol Sugar Syrup', 'COCKTAILS', 'bottle', 5.19, 'st-austell', 5),

-- SHOOTERS
(gen_random_uuid(), 'Tequila Rose', 'SHOOTERS', 'bottle', 18.09, 'st-austell', 3),
(gen_random_uuid(), 'Dr Hydes/Jaeger', 'SHOOTERS', 'bottle', 17.49, 'st-austell', 3),
(gen_random_uuid(), 'DMF Raspberry Liqueur', 'SHOOTERS', 'bottle', 11.79, 'st-austell', 3),
(gen_random_uuid(), 'Jose Cuervo White Teq', 'SHOOTERS', 'bottle', 21.39, 'st-austell', 3),
(gen_random_uuid(), 'Jose Cuervo Gold Teq', 'SHOOTERS', 'bottle', 20.59, 'st-austell', 3),
(gen_random_uuid(), 'Luxardo Sambuca', 'SHOOTERS', 'bottle', 16.29, 'st-austell', 3),
(gen_random_uuid(), 'Luxardo Black Sambuca', 'SHOOTERS', 'bottle', 16.99, 'st-austell', 3),

-- SPIRITS MISC
(gen_random_uuid(), 'Courvoisier', 'SPIRITS MISC', 'bottle', 25.79, 'st-austell', 3),
(gen_random_uuid(), 'Cockburns', 'SPIRITS MISC', 'bottle', 10.52, 'st-austell', 3),
(gen_random_uuid(), 'Disaronno Amaretto', 'SPIRITS MISC', 'bottle', 19.39, 'st-austell', 3),
(gen_random_uuid(), 'Malibu', 'SPIRITS MISC', 'bottle', 14.29, 'st-austell', 5),
(gen_random_uuid(), 'Bacardi', 'SPIRITS MISC', 'bottle', 17.69, 'st-austell', 5),
(gen_random_uuid(), 'Baileys', 'SPIRITS MISC', 'bottle', 14.09, 'st-austell', 5),

-- RED WINES
(gen_random_uuid(), 'Billycan Shiraz', 'RED WINE', 'bottle', 7.21, 'st-austell', 10),
(gen_random_uuid(), 'Alta Merlot', 'RED WINE', 'bottle', 6.43, 'st-austell', 10),
(gen_random_uuid(), 'Alta Cab Sauv', 'RED WINE', 'bottle', 6.43, 'st-austell', 10),

-- ROSE WINE
(gen_random_uuid(), 'Tanti Pinot Rose', 'ROSE WINE', 'bottle', 6.20, 'st-austell', 10),
(gen_random_uuid(), 'Falling Petal Rose', 'ROSE WINE', 'bottle', 6.63, 'st-austell', 10),

-- WHITE WINE
(gen_random_uuid(), 'Arapala Sky Chardonnay', 'WHITE WINE', 'bottle', 5.82, 'st-austell', 10),
(gen_random_uuid(), 'Frunza Pinot Grigio', 'WHITE WINE', 'bottle', 6.30, 'st-austell', 10),
(gen_random_uuid(), 'Sauv Blanc Rue de Amis', 'WHITE WINE', 'bottle', 6.92, 'st-austell', 10),
(gen_random_uuid(), 'Seafarer Sauv Blanc NZ', 'WHITE WINE', 'bottle', 9.45, 'st-austell', 8),

-- BUBBLES
(gen_random_uuid(), 'Pouring Prosecco', 'BUBBLES', 'bottle', 6.67, 'st-austell', 15),
(gen_random_uuid(), 'Bottles Prosecco', 'BUBBLES', 'bottle', 7.77, 'st-austell', 20);

-- Add stock levels for all St Austell products
INSERT INTO public.stock_levels (product_id, location, quantity)
SELECT 
  p.id,
  'bar',
  CASE 
    WHEN p.category IN ('RED WINE', 'WHITE WINE', 'ROSE WINE') THEN 15
    WHEN p.category = 'BUBBLES' THEN 25
    WHEN p.category IN ('WHISKEY', 'GIN', 'RUM', 'VODKA') THEN 8
    ELSE 5
  END
FROM public.products p
WHERE p.supplier_id = 'st-austell';

INSERT INTO public.stock_levels (product_id, location, quantity)
SELECT 
  p.id,
  'cellar',
  CASE 
    WHEN p.category IN ('RED WINE', 'WHITE WINE', 'ROSE WINE') THEN 40
    WHEN p.category = 'BUBBLES' THEN 60
    WHEN p.category IN ('WHISKEY', 'GIN', 'RUM', 'VODKA') THEN 20
    ELSE 12
  END
FROM public.products p
WHERE p.supplier_id = 'st-austell';