-- ============================================
-- SEED: Armeria Palmetto — Dati dimostrativi
-- ============================================

-- ============================================
-- SITE SETTINGS
-- ============================================
INSERT INTO site_settings (key, value) VALUES
  ('site_name', '"Armeria Palmetto"'),
  ('site_description', '"La miglior armeria di Brescia. Vendita armi, munizioni, fuochi artificiali e accessori."'),
  ('contact_email', '"info@palmetto.it"'),
  ('contact_phone', '"030 370 0800"'),
  ('address', '{"street": "Via Guglielmo Oberdan, 70", "city": "Brescia", "zip": "25128", "province": "BS"}'),
  ('social_links', '{"facebook": "https://facebook.com/armeriapalmetto", "instagram": "https://instagram.com/armeriapalmetto"}'),
  ('business_hours', '{"mon": "9:00-12:30, 15:00-19:00", "tue": "9:00-12:30, 15:00-19:00", "wed": "9:00-12:30, 15:00-19:00", "thu": "9:00-12:30, 15:00-19:00", "fri": "9:00-12:30, 15:00-19:00", "sat": "9:00-12:30", "sun": "Chiuso"}'),
  ('currency', '"EUR"'),
  ('tax_rate', '22')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
-- ============================================
-- CATEGORIES
-- ============================================
INSERT INTO categories (id, name, slug, description, image_url, parent_id, sort_order, is_active) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Armi da Fuoco', 'armi-da-fuoco', 'Pistole, fucili, carabine delle migliori marche', 'https://placehold.co/400x300/1a1a1a/ffffff?text=Armi+da+Fuoco', NULL, 1, true),
  ('a0000000-0000-0000-0000-000000000002', 'Pistole', 'pistole', 'Pistole semiautomatiche e revolver', 'https://placehold.co/400x300/c62828/ffffff?text=Pistole', 'a0000000-0000-0000-0000-000000000001', 1, true),
  ('a0000000-0000-0000-0000-000000000003', 'Fucili', 'fucili', 'Fucili da caccia, tiro sportivo e difesa', 'https://placehold.co/400x300/c62828/ffffff?text=Fucili', 'a0000000-0000-0000-0000-000000000001', 2, true),
  ('a0000000-0000-0000-0000-000000000004', 'Carabine', 'carabine', 'Carabine a leva, bolt action e semiautomatiche', 'https://placehold.co/400x300/c62828/ffffff?text=Carabine', 'a0000000-0000-0000-0000-000000000001', 3, true),
  ('a0000000-0000-0000-0000-000000000005', 'Munizioni', 'munizioni', 'Munizioni per ogni calibro e utilizzo', 'https://placehold.co/400x300/1a1a1a/ffffff?text=Munizioni', NULL, 2, true),
  ('a0000000-0000-0000-0000-000000000006', 'Munizioni Pistola', 'munizioni-pistola', 'Calibri 9mm, .45 ACP, .40 S&W e altri', 'https://placehold.co/400x300/d4a017/1a1a1a?text=Mun.+Pistola', 'a0000000-0000-0000-0000-000000000005', 1, true),
  ('a0000000-0000-0000-0000-000000000007', 'Munizioni Fucile', 'munizioni-fucile', 'Calibri .308, .223, 12 gauge e altri', 'https://placehold.co/400x300/d4a017/1a1a1a?text=Mun.+Fucile', 'a0000000-0000-0000-0000-000000000005', 2, true),
  ('a0000000-0000-0000-0000-000000000008', 'Fuochi Artificiali', 'fuochi-artificiali', 'Spettacoli pirotecnici e fuochi per ogni occasione', 'https://placehold.co/400x300/c62828/ffffff?text=Fuochi+Artificiali', NULL, 3, true),
  ('a0000000-0000-0000-0000-000000000009', 'Accessori', 'accessori', 'Ottiche, fondine, pulizia armi, bersagli e altro', 'https://placehold.co/400x300/1a1a1a/ffffff?text=Accessori', NULL, 4, true),
  ('a0000000-0000-0000-0000-000000000010', 'Ottiche e Red Dot', 'ottiche-red-dot', 'Cannocchiali, red dot, mirini olografici', 'https://placehold.co/400x300/d4a017/1a1a1a?text=Ottiche', 'a0000000-0000-0000-0000-000000000009', 1, true),
  ('a0000000-0000-0000-0000-000000000011', 'Fondine e Custodie', 'fondine-custodie', 'Fondine tattiche, da cintura, custodie imbottite', 'https://placehold.co/400x300/d4a017/1a1a1a?text=Fondine', 'a0000000-0000-0000-0000-000000000009', 2, true),
  ('a0000000-0000-0000-0000-000000000012', 'Pulizia e Manutenzione', 'pulizia-manutenzione', 'Kit pulizia, oli, solventi, bacchette', 'https://placehold.co/400x300/d4a017/1a1a1a?text=Pulizia', 'a0000000-0000-0000-0000-000000000009', 3, true);
-- ============================================
-- PRODUCTS
-- ============================================
INSERT INTO products (id, name, slug, description, rich_description, price, compare_at_price, sku, stock_quantity, category_id, is_active, is_featured) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Beretta 92FS', 'beretta-92fs', 'Pistola semiautomatica calibro 9x21mm.', '<p>La <strong>Beretta 92FS</strong> è una delle pistole più iconiche al mondo. Calibro 9x21mm, canna da 125mm, caricatore da 15 colpi.</p>', 850.00, NULL, 'BER-92FS-9', 12, 'a0000000-0000-0000-0000-000000000002', true, true),
  ('b0000000-0000-0000-0000-000000000002', 'Glock 17 Gen5', 'glock-17-gen5', 'Pistola semiautomatica calibro 9x21mm.', '<p>La <strong>Glock 17 Gen5</strong> rappresenta l''evoluzione della pistola più diffusa al mondo. Calibro 9x21mm, caricatore da 17 colpi.</p>', 720.00, NULL, 'GLK-17G5-9', 8, 'a0000000-0000-0000-0000-000000000002', true, true),
  ('b0000000-0000-0000-0000-000000000003', 'Sig Sauer P226', 'sig-sauer-p226', 'Pistola semiautomatica calibro 9x21mm.', '<p>La <strong>Sig Sauer P226</strong> è la scelta dei professionisti. Fusto in lega leggera, carrello in acciaio, grilletto DA/SA.</p>', 1150.00, 1250.00, 'SIG-P226-9', 5, 'a0000000-0000-0000-0000-000000000002', true, true),
  ('b0000000-0000-0000-0000-000000000004', 'CZ 75 Shadow 2', 'cz-75-shadow-2', 'Pistola da competizione calibro 9x21mm.', '<p>La <strong>CZ 75 Shadow 2</strong> è progettata per la competizione. Peso bilanciato, grilletto SA perfezionato, 19 colpi.</p>', 1380.00, NULL, 'CZ-SH2-9', 4, 'a0000000-0000-0000-0000-000000000002', true, false),
  ('b0000000-0000-0000-0000-000000000005', 'Smith & Wesson 686', 'sw-686', 'Revolver calibro .357 Magnum. 6 colpi, acciaio inox.', '<p>Il <strong>S&W 686</strong> è il revolver per eccellenza. Calibro .357 Magnum, acciaio inossidabile, grilletto liscio.</p>', 980.00, NULL, 'SW-686-357', 6, 'a0000000-0000-0000-0000-000000000002', true, false),
  ('b0000000-0000-0000-0000-000000000006', 'Benelli Raffaello', 'benelli-raffaello', 'Fucile semiautomatico calibro 12.', '<p>Il <strong>Benelli Raffaello</strong> è il fucile da caccia per eccellenza. Sistema Inertia Driven, calibro 12, calcio in noce.</p>', 1650.00, NULL, 'BEN-RAFF-12', 7, 'a0000000-0000-0000-0000-000000000003', true, true),
  ('b0000000-0000-0000-0000-000000000007', 'Beretta 694 Sporting', 'beretta-694-sporting', 'Sovrapposto calibro 12 per tiro sportivo.', '<p>La <strong>Beretta 694 Sporting</strong> è un sovrapposto di alta gamma. Bascula in acciaio, canne Steelium.</p>', 3200.00, 3500.00, 'BER-694-12', 3, 'a0000000-0000-0000-0000-000000000003', true, true),
  ('b0000000-0000-0000-0000-000000000008', 'Franchi Affinity 3', 'franchi-affinity-3', 'Fucile semiautomatico calibro 12.', '<p>Il <strong>Franchi Affinity 3</strong> pesa solo 2.9 kg. Sistema Inertia Driven, calibro 12, canna da 71cm.</p>', 1100.00, NULL, 'FRA-AFF3-12', 9, 'a0000000-0000-0000-0000-000000000003', true, false),
  ('b0000000-0000-0000-0000-000000000009', 'CZ 457 Varmint', 'cz-457-varmint', 'Carabina bolt action calibro .22 LR.', '<p>La <strong>CZ 457 Varmint</strong> è ideale per il tiro di precisione. Calibro .22 LR, canna heavy barrel, grilletto regolabile.</p>', 680.00, NULL, 'CZ-457V-22', 10, 'a0000000-0000-0000-0000-000000000004', true, false),
  ('b0000000-0000-0000-0000-000000000010', 'Tikka T3x Lite', 'tikka-t3x-lite', 'Carabina bolt action calibro .308 Win.', '<p>La <strong>Tikka T3x Lite</strong> è una bolt action finlandese. Calibro .308 Win, canna da 57cm, peso 2.9 kg.</p>', 1050.00, NULL, 'TIK-T3XL-308', 6, 'a0000000-0000-0000-0000-000000000004', true, true),
  ('b0000000-0000-0000-0000-000000000011', 'Federal 9mm 124gr FMJ (x50)', 'federal-9mm-124gr-fmj', 'Munizioni 9mm Luger 124 grani FMJ. Conf. 50.', '<p>Munizioni <strong>Federal American Eagle</strong> 9mm Luger, 124 grani FMJ. Confezione da 50.</p>', 18.50, NULL, 'FED-9MM-124-50', 200, 'a0000000-0000-0000-0000-000000000006', true, false),
  ('b0000000-0000-0000-0000-000000000012', 'Fiocchi 9mm 115gr FMJ (x50)', 'fiocchi-9mm-115gr-fmj', 'Munizioni 9mm Luger 115 grani FMJ italiane. Conf. 50.', '<p>Munizioni <strong>Fiocchi</strong> 9mm Luger, 115 grani FMJ. Prodotte in Italia. Confezione da 50.</p>', 15.00, NULL, 'FIO-9MM-115-50', 500, 'a0000000-0000-0000-0000-000000000006', true, true),
  ('b0000000-0000-0000-0000-000000000013', 'Sellier & Bellot .45 ACP 230gr FMJ (x50)', 'sb-45acp-230gr-fmj', 'Munizioni .45 ACP 230 grani FMJ. Conf. 50.', '<p>Munizioni <strong>Sellier & Bellot</strong> .45 ACP, 230 grani FMJ. Confezione da 50.</p>', 28.00, NULL, 'SB-45-230-50', 150, 'a0000000-0000-0000-0000-000000000006', true, false),
  ('b0000000-0000-0000-0000-000000000014', 'Fiocchi 12ga Trap 24gr (x25)', 'fiocchi-12ga-trap-24gr', 'Cartucce calibro 12, 24g piombo 7.5. Conf. 25.', '<p>Cartucce <strong>Fiocchi</strong> calibro 12, 24g piombo n.7.5. Ideali per Trap e Skeet. Confezione da 25.</p>', 9.50, NULL, 'FIO-12T-24-25', 800, 'a0000000-0000-0000-0000-000000000007', true, false),
  ('b0000000-0000-0000-0000-000000000015', 'Federal .308 Win 150gr SP (x20)', 'federal-308-150gr-sp', 'Munizioni .308 Win 150gr Soft Point. Conf. 20.', '<p>Munizioni <strong>Federal Power-Shok</strong> .308 Win, 150 grani Soft Point. Confezione da 20.</p>', 32.00, NULL, 'FED-308-150-20', 100, 'a0000000-0000-0000-0000-000000000007', true, false),
  ('b0000000-0000-0000-0000-000000000016', 'CCI .22 LR Standard Velocity (x50)', 'cci-22lr-sv-50', 'Munizioni .22 LR 40gr, subsoniche. Conf. 50.', '<p>Munizioni <strong>CCI Standard Velocity</strong> .22 LR, 40 grani, subsoniche. Confezione da 50.</p>', 7.50, NULL, 'CCI-22LR-SV-50', 1000, 'a0000000-0000-0000-0000-000000000007', true, false),
  ('b0000000-0000-0000-0000-000000000017', '500 Bangs', '500-bangs', 'Batteria 500 colpi multicolor.', '<p><strong>500 Bangs</strong> — batteria pirotecnica da 500 colpi multicolore. Durata circa 3 minuti.</p>', 10.00, NULL, 'FUO-500B', 50, 'a0000000-0000-0000-0000-000000000008', true, true),
  ('b0000000-0000-0000-0000-000000000018', 'Adrenaline', 'adrenaline', 'Batteria professionale 25 colpi 30mm.', '<p><strong>Adrenaline</strong> — batteria pirotecnica professionale, 25 colpi calibro 30mm ad alta quota.</p>', 20.00, NULL, 'FUO-ADREN', 35, 'a0000000-0000-0000-0000-000000000008', true, true),
  ('b0000000-0000-0000-0000-000000000019', 'Battaglia dell''Assietta', 'battaglia-assietta', 'Batteria top di gamma 100 colpi.', '<p><strong>Battaglia dell''Assietta</strong> — 100 colpi calibro 25-30mm, finale a ventaglio. Durata 5 minuti.</p>', 70.00, 85.00, 'FUO-BASS', 20, 'a0000000-0000-0000-0000-000000000008', true, true),
  ('b0000000-0000-0000-0000-000000000020', 'Vortex Crossfire II 3-9x40', 'vortex-crossfire-3-9x40', 'Cannocchiale 3-9x40mm, reticolo V-Plex.', '<p>Il <strong>Vortex Crossfire II 3-9x40</strong> offre lenti multi-coated, reticolo V-Plex, tubo da 1 pollice.</p>', 220.00, NULL, 'VOR-CF2-3940', 15, 'a0000000-0000-0000-0000-000000000010', true, false),
  ('b0000000-0000-0000-0000-000000000021', 'Fondina Safariland GLS Pro-Fit', 'safariland-gls-profit', 'Fondina tattica con ritenzione automatica GLS.', '<p>La <strong>Safariland GLS Pro-Fit</strong> offre ritenzione automatica. Compatibile con Glock, Beretta, Sig Sauer.</p>', 75.00, NULL, 'SAF-GLS-PF', 20, 'a0000000-0000-0000-0000-000000000011', true, false),
  ('b0000000-0000-0000-0000-000000000022', 'Kit Pulizia Hoppe''s No.9', 'hoppes-kit-pulizia', 'Kit pulizia completo per armi corte e lunghe.', '<p>Il <strong>Kit Hoppe''s No.9</strong> contiene solvente, olio, bacchette, spazzole e pezzuole. Per calibri da .22 a 12ga.</p>', 45.00, NULL, 'HOP-KIT-UNI', 30, 'a0000000-0000-0000-0000-000000000012', true, false);
-- ============================================
-- PRODUCT IMAGES
-- ============================================
INSERT INTO product_images (id, product_id, url, alt_text, sort_order, is_primary) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'https://placehold.co/600x600/1a1a1a/ffffff?text=Beretta+92FS', 'Beretta 92FS', 1, true),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'https://placehold.co/600x600/1a1a1a/ffffff?text=Glock+17+Gen5', 'Glock 17 Gen5', 1, true),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'https://placehold.co/600x600/1a1a1a/ffffff?text=Sig+Sauer+P226', 'Sig Sauer P226', 1, true),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'https://placehold.co/600x600/1a1a1a/ffffff?text=CZ+75+Shadow+2', 'CZ 75 Shadow 2', 1, true),
  ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 'https://placehold.co/600x600/1a1a1a/ffffff?text=SW+686', 'Smith Wesson 686', 1, true),
  ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', 'https://placehold.co/600x600/1a1a1a/ffffff?text=Benelli+Raffaello', 'Benelli Raffaello', 1, true),
  ('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000007', 'https://placehold.co/600x600/1a1a1a/ffffff?text=Beretta+694', 'Beretta 694 Sporting', 1, true),
  ('c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000008', 'https://placehold.co/600x600/1a1a1a/ffffff?text=Franchi+Affinity+3', 'Franchi Affinity 3', 1, true),
  ('c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000009', 'https://placehold.co/600x600/1a1a1a/ffffff?text=CZ+457+Varmint', 'CZ 457 Varmint', 1, true),
  ('c0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000010', 'https://placehold.co/600x600/1a1a1a/ffffff?text=Tikka+T3x+Lite', 'Tikka T3x Lite', 1, true),
  ('c0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000011', 'https://placehold.co/600x600/d4a017/1a1a1a?text=Federal+9mm', 'Federal 9mm FMJ', 1, true),
  ('c0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000012', 'https://placehold.co/600x600/d4a017/1a1a1a?text=Fiocchi+9mm', 'Fiocchi 9mm FMJ', 1, true),
  ('c0000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000013', 'https://placehold.co/600x600/d4a017/1a1a1a?text=SB+45+ACP', 'Sellier Bellot 45 ACP', 1, true),
  ('c0000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000014', 'https://placehold.co/600x600/d4a017/1a1a1a?text=Fiocchi+12ga', 'Fiocchi 12 Gauge', 1, true),
  ('c0000000-0000-0000-0000-000000000015', 'b0000000-0000-0000-0000-000000000015', 'https://placehold.co/600x600/d4a017/1a1a1a?text=Federal+308', 'Federal 308 Win', 1, true),
  ('c0000000-0000-0000-0000-000000000016', 'b0000000-0000-0000-0000-000000000016', 'https://placehold.co/600x600/d4a017/1a1a1a?text=CCI+22+LR', 'CCI 22 LR', 1, true),
  ('c0000000-0000-0000-0000-000000000017', 'b0000000-0000-0000-0000-000000000017', 'https://placehold.co/600x600/c62828/ffffff?text=500+Bangs', '500 Bangs', 1, true),
  ('c0000000-0000-0000-0000-000000000018', 'b0000000-0000-0000-0000-000000000018', 'https://placehold.co/600x600/c62828/ffffff?text=Adrenaline', 'Adrenaline', 1, true),
  ('c0000000-0000-0000-0000-000000000019', 'b0000000-0000-0000-0000-000000000019', 'https://placehold.co/600x600/c62828/ffffff?text=Battaglia+Assietta', 'Battaglia Assietta', 1, true),
  ('c0000000-0000-0000-0000-000000000020', 'b0000000-0000-0000-0000-000000000020', 'https://placehold.co/600x600/1a1a1a/ffffff?text=Vortex+3-9x40', 'Vortex Crossfire II', 1, true),
  ('c0000000-0000-0000-0000-000000000021', 'b0000000-0000-0000-0000-000000000021', 'https://placehold.co/600x600/1a1a1a/ffffff?text=Safariland+GLS', 'Safariland GLS', 1, true),
  ('c0000000-0000-0000-0000-000000000022', 'b0000000-0000-0000-0000-000000000022', 'https://placehold.co/600x600/1a1a1a/ffffff?text=Hoppes+Kit', 'Kit Pulizia Hoppes', 1, true);
-- ============================================
-- BLOG POSTS (is_published boolean, rich_content field)
-- ============================================
INSERT INTO blog_posts (id, title, slug, excerpt, rich_content, cover_image_url, tags, is_published, published_at) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'Guida alla scelta della prima pistola', 'guida-scelta-prima-pistola',
    'Tutto quello che devi sapere prima di acquistare la tua prima arma corta.',
    '<h2>Come scegliere la prima pistola</h2><p>L''acquisto della prima pistola è un momento importante. Analizziamo i fattori chiave: calibro, dimensioni, peso e budget.</p><h3>Calibro</h3><p>Per un principiante il 9x21mm è la scelta migliore: rinculo gestibile e munizioni economiche.</p><h3>Budget</h3><p>Preventivate tra 500 e 1200 euro per una buona pistola nuova.</p>',
    'https://placehold.co/1200x600/1a1a1a/ffffff?text=Guida+Prima+Pistola',
    ARRAY['guide', 'pistole', 'principianti'], true, NOW() - INTERVAL '7 days'),
  ('d0000000-0000-0000-0000-000000000002', 'Manutenzione delle armi: consigli essenziali', 'manutenzione-armi-consigli',
    'La pulizia regolare è fondamentale per sicurezza e longevità della tua arma.',
    '<h2>Perché la manutenzione è importante</h2><p>Un''arma ben mantenuta è un''arma sicura. La pulizia regolare previene malfunzionamenti e corrosione.</p><h3>Kit essenziale</h3><p>Solvente, olio lubrificante, bacchette, spazzole in bronzo e pezzuole.</p>',
    'https://placehold.co/1200x600/d4a017/1a1a1a?text=Manutenzione+Armi',
    ARRAY['manutenzione', 'pulizia', 'consigli'], true, NOW() - INTERVAL '3 days'),
  ('d0000000-0000-0000-0000-000000000003', 'Fuochi artificiali: normativa e sicurezza', 'fuochi-artificiali-normativa',
    'Normative italiane per acquisto e utilizzo di fuochi artificiali.',
    '<h2>Normativa italiana</h2><p>I fuochi artificiali sono classificati in categorie F1-F4. F1 e F2 sono acquistabili dai maggiorenni senza licenza.</p><h3>Sicurezza</h3><p>Mantenere la distanza di sicurezza indicata. Non accendere mai fuochi in luoghi chiusi.</p>',
    'https://placehold.co/1200x600/c62828/ffffff?text=Fuochi+Artificiali',
    ARRAY['fuochi artificiali', 'normativa', 'sicurezza'], true, NOW() - INTERVAL '1 day'),
  ('d0000000-0000-0000-0000-000000000004', 'Le novità dal Shot Show 2026', 'novita-shot-show-2026',
    'Le armi più interessanti presentate al Shot Show di Las Vegas.',
    '<h2>Shot Show 2026</h2><p>Articolo in arrivo... Restate sintonizzati!</p>',
    'https://placehold.co/1200x600/1a1a1a/ffffff?text=Shot+Show+2026',
    ARRAY['novità', 'fiere'], false, NULL);

-- ============================================
-- PAGES (is_published boolean, no sort_order)
-- ============================================
INSERT INTO pages (id, title, slug, rich_content, is_published, published_at) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'Chi Siamo', 'chi-siamo',
    '<h2>La Nostra Storia</h2><p>Armeria Palmetto è un pilastro della comunità di Brescia da decenni. Offriamo armi e munizioni delle migliori marche.</p><h2>I Nostri Servizi</h2><p>Vendita armi, assistenza post-vendita, riparazioni, consulenza, taratura armi e fuochi artificiali.</p>',
    true, NOW()),
  ('e0000000-0000-0000-0000-000000000002', 'Contatti', 'contatti',
    '<h2>Contattaci</h2><p>Via Guglielmo Oberdan, 70 — 25128 Brescia (BS)</p><p>Tel: 030 370 0800</p><p>Email: info@palmetto.it</p><h3>Orari</h3><p>Lun-Ven: 9:00-12:30, 15:00-19:00 | Sab: 9:00-12:30 | Dom: Chiuso</p>',
    true, NOW()),
  ('e0000000-0000-0000-0000-000000000003', 'Privacy Policy', 'privacy-policy',
    '<h2>Informativa sulla Privacy</h2><p>Ai sensi del Regolamento UE 2016/679 (GDPR). Contenuto completo da inserire.</p>',
    true, NOW()),
  ('e0000000-0000-0000-0000-000000000004', 'Termini e Condizioni', 'terms',
    '<h2>Termini e Condizioni di Vendita</h2><p>Condizioni generali di vendita di Armeria Palmetto. Contenuto completo da inserire.</p>',
    true, NOW()),
  ('e0000000-0000-0000-0000-000000000005', 'Cookie Policy', 'cookie-policy',
    '<h2>Cookie Policy</h2><p>Questo sito utilizza cookie tecnici e, previo consenso, cookie di profilazione. Contenuto completo da inserire.</p>',
    true, NOW());
-- ============================================
-- BOOKING SERVICES (no slug column)
-- ============================================
INSERT INTO booking_services (id, name, description, duration_minutes, price, is_active, sort_order) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'Consulenza Acquisto Arma', 'Consulenza personalizzata per la scelta dell''arma più adatta alle tue esigenze.', 30, 0.00, true, 1),
  ('f0000000-0000-0000-0000-000000000002', 'Taratura Ottica', 'Servizio professionale di taratura e azzeramento ottiche su carabine e fucili.', 60, 50.00, true, 2),
  ('f0000000-0000-0000-0000-000000000003', 'Pulizia e Manutenzione Completa', 'Pulizia completa con smontaggio, sgrassaggio, lubrificazione e controllo parti.', 45, 35.00, true, 3),
  ('f0000000-0000-0000-0000-000000000004', 'Riparazione Arma', 'Diagnosi e riparazione. Preventivo gratuito, riparazione solo se accettata.', 60, 0.00, true, 4),
  ('f0000000-0000-0000-0000-000000000005', 'Consulenza Spettacolo Pirotecnico', 'Pianificazione spettacolo pirotecnico per eventi, matrimoni, feste.', 45, 0.00, true, 5);

-- ============================================
-- BOOKING AVAILABILITY (day_of_week 0=Sun..6=Sat)
-- ============================================
INSERT INTO booking_availability (id, day_of_week, start_time, end_time, is_active) VALUES
  ('aa000000-0000-0000-0000-000000000001', 1, '09:00', '12:30', true),
  ('aa000000-0000-0000-0000-000000000002', 1, '15:00', '19:00', true),
  ('aa000000-0000-0000-0000-000000000003', 2, '09:00', '12:30', true),
  ('aa000000-0000-0000-0000-000000000004', 2, '15:00', '19:00', true),
  ('aa000000-0000-0000-0000-000000000005', 3, '09:00', '12:30', true),
  ('aa000000-0000-0000-0000-000000000006', 3, '15:00', '19:00', true),
  ('aa000000-0000-0000-0000-000000000007', 4, '09:00', '12:30', true),
  ('aa000000-0000-0000-0000-000000000008', 4, '15:00', '19:00', true),
  ('aa000000-0000-0000-0000-000000000009', 5, '09:00', '12:30', true),
  ('aa000000-0000-0000-0000-000000000010', 5, '15:00', '19:00', true),
  ('aa000000-0000-0000-0000-000000000011', 6, '09:00', '12:30', true);