-- Remove existing generic products and add correct beverage products
DELETE FROM public.stock_levels WHERE product_id IN (SELECT id FROM public.products);
DELETE FROM public.products;

-- Insert correct beverage products for Star Pubs-Heineken supplier
INSERT INTO public.products (id, name, category, unit, current_price, supplier_id, reorder_point) VALUES
-- Cordials/Post-Mix
(gen_random_uuid(), 'Diet Coke PostMix', 'Cordials/Post-Mix', 'case', 72.21, 'star-pubs', 2),
(gen_random_uuid(), 'Sweppes Lemon PostMix', 'Cordials/Post-Mix', 'case', 78.46, 'star-pubs', 2),
(gen_random_uuid(), 'Coke Zero PostMix', 'Cordials/Post-Mix', 'case', 61.67, 'star-pubs', 2),
(gen_random_uuid(), 'Blackcurrent 12Pack', 'Cordials/Post-Mix', 'case', 25.07, 'star-pubs', 3),
(gen_random_uuid(), 'Lime 12Pack', 'Cordials/Post-Mix', 'case', 24.19, 'star-pubs', 3),

-- Soft Bottles Single Serve
(gen_random_uuid(), 'J20 Apple & Rasp', 'Soft Bottles Single Serve', 'case', 25.83, 'star-pubs', 2),
(gen_random_uuid(), 'J20 Apple & Mango', 'Soft Bottles Single Serve', 'case', 24.89, 'star-pubs', 2),
(gen_random_uuid(), 'J20 Orange & Passionfruit', 'Soft Bottles Single Serve', 'case', 25.83, 'star-pubs', 2),
(gen_random_uuid(), 'Britvic 55', 'Soft Bottles Single Serve', 'case', 24.15, 'star-pubs', 2),
(gen_random_uuid(), 'Harrogate Water PET', 'Soft Bottles Single Serve', 'case', 7.70, 'star-pubs', 4),
(gen_random_uuid(), 'Kingsdown Still 24Pack', 'Soft Bottles Single Serve', 'case', 11.61, 'star-pubs', 3),
(gen_random_uuid(), 'Kingsdown Spark 24Pack', 'Soft Bottles Single Serve', 'case', 11.61, 'star-pubs', 3),
(gen_random_uuid(), 'Red Bull 24Pack', 'Soft Bottles Single Serve', 'case', 31.65, 'star-pubs', 2),

-- Mixers
(gen_random_uuid(), 'Schweppes Orange Juice 24Pack', 'Mixers', 'case', 15.83, 'star-pubs', 3),
(gen_random_uuid(), 'Schweppes Ginger Beer 24Pack', 'Mixers', 'case', 14.05, 'star-pubs', 3),
(gen_random_uuid(), 'Canada Dry Ales 24Pack', 'Mixers', 'case', 14.05, 'star-pubs', 3),
(gen_random_uuid(), 'Schweppes Tonic', 'Mixers', 'case', 15.36, 'star-pubs', 3),
(gen_random_uuid(), 'Schweppes Slimline Tonic', 'Mixers', 'case', 15.36, 'star-pubs', 3),
(gen_random_uuid(), 'Sunpride Cranberry 12Pack', 'Mixers', 'case', 14.70, 'star-pubs', 3),

-- Bottled Lager
(gen_random_uuid(), 'Sol 24Pack', 'Bottled Lager', 'case', 25.75, 'star-pubs', 2),
(gen_random_uuid(), 'Estrella 24Pack', 'Bottled Lager', 'case', 35.54, 'star-pubs', 2),
(gen_random_uuid(), 'CruzCampo', 'Bottled Lager', 'case', 30.35, 'star-pubs', 2),
(gen_random_uuid(), 'Birra Moretti 24Pack', 'Bottled Lager', 'case', 32.15, 'star-pubs', 2),
(gen_random_uuid(), 'Desperados 24Pack', 'Bottled Lager', 'case', 34.51, 'star-pubs', 2),

-- No & Low Bottles
(gen_random_uuid(), 'Birra Moretti Zero 24Pack', 'No & Low Bottles', 'case', 22.16, 'star-pubs', 2),
(gen_random_uuid(), 'Heineken Zero 24Pack', 'No & Low Bottles', 'case', 20.37, 'star-pubs', 2),
(gen_random_uuid(), 'Old Mout Berries 0.0%', 'No & Low Bottles', 'case', 22.27, 'star-pubs', 2),
(gen_random_uuid(), 'Old M Pine Rasp 0.0%', 'No & Low Bottles', 'case', 22.27, 'star-pubs', 2),

-- Fruity Cider
(gen_random_uuid(), 'Old M Kiwi & Lime 12Pack', 'Fruity Cider', 'case', 28.17, 'star-pubs', 2),
(gen_random_uuid(), 'Old M Berry & Cherry 12Pack', 'Fruity Cider', 'case', 28.17, 'star-pubs', 2),
(gen_random_uuid(), 'Old M Pineapple & Raspberry', 'Fruity Cider', 'case', 27.77, 'star-pubs', 2),

-- Bottled Beer
(gen_random_uuid(), 'Sharpes Doom Bar 8Pack', 'Bottled Beer', 'case', 16.69, 'star-pubs', 2),
(gen_random_uuid(), 'Rev James', 'Bottled Beer', 'case', 20.47, 'star-pubs', 2),
(gen_random_uuid(), 'Speckled Hen (GF) 8Pack', 'Bottled Beer', 'case', 19.14, 'star-pubs', 2),

-- Bottled Cider
(gen_random_uuid(), 'Thatchers Katy 6Pack', 'Bottled Cider', 'case', 14.31, 'star-pubs', 2),
(gen_random_uuid(), 'Thatchers Gold 6Pack', 'Bottled Cider', 'case', 14.31, 'star-pubs', 2),
(gen_random_uuid(), 'Thatchers Haze 6Pack', 'Bottled Cider', 'case', 12.32, 'star-pubs', 2),

-- Draught Keg
(gen_random_uuid(), 'Guinness Stout 30l', 'Draught Keg', 'keg', 135.91, 'star-pubs', 1),
(gen_random_uuid(), 'Guinness Stout 50l', 'Draught Keg', 'keg', 223.48, 'star-pubs', 1),
(gen_random_uuid(), 'Amstel Lager 50L', 'Draught Keg', 'keg', 170.21, 'star-pubs', 1),
(gen_random_uuid(), 'San Miguel', 'Draught Keg', 'keg', 253.26, 'star-pubs', 1),
(gen_random_uuid(), 'Inches Cider 50L', 'Draught Keg', 'keg', 159.68, 'star-pubs', 1),

-- Craft Draught Keg
(gen_random_uuid(), 'B/town Neck Oil IPA 30L', 'Craft Draught Keg', 'keg', 131.47, 'star-pubs', 1),
(gen_random_uuid(), 'B/town Neck Oil IPA 50L', 'Craft Draught Keg', 'keg', 219.10, 'star-pubs', 1),
(gen_random_uuid(), 'B/town GammaRay IPA 30L', 'Craft Draught Keg', 'keg', 147.79, 'star-pubs', 1);

-- Add stock levels for all new products
INSERT INTO public.stock_levels (product_id, location, quantity)
SELECT 
  p.id,
  unnest(ARRAY['bar', 'cellar']) as location,
  CASE 
    WHEN p.category IN ('Draught Keg', 'Craft Draught Keg') THEN 1
    WHEN p.category = 'Soft Bottles Single Serve' THEN 3
    ELSE 2
  END as quantity
FROM public.products p
WHERE p.supplier_id = 'star-pubs';