// ─────────────────────────────────────────────────────────────────────────────
// OnlyBuddy — Curated UK Grocery Products Database
// ~400 common items with typical UK supermarket prices (approximate)
// Images fall back to Open Food Facts API (CC-BY-SA) for real product photos
// ─────────────────────────────────────────────────────────────────────────────

export const CATEGORIES = [
  { id: 'dairy',      label: 'Dairy & Eggs',      emoji: '🥛' },
  { id: 'bread',      label: 'Bread & Bakery',    emoji: '🍞' },
  { id: 'meat',       label: 'Meat & Fish',        emoji: '🥩' },
  { id: 'fruit',      label: 'Fruit & Veg',        emoji: '🥦' },
  { id: 'frozen',     label: 'Frozen',             emoji: '🧊' },
  { id: 'tinned',     label: 'Tinned & Jarred',    emoji: '🥫' },
  { id: 'pasta',      label: 'Pasta, Rice & Grains',emoji: '🍝' },
  { id: 'snacks',     label: 'Snacks & Crisps',    emoji: '🍿' },
  { id: 'drinks',     label: 'Drinks & Juice',     emoji: '🧃' },
  { id: 'cereal',     label: 'Cereals & Breakfast',emoji: '🥣' },
  { id: 'condiments', label: 'Sauces & Condiments',emoji: '🧴' },
  { id: 'cleaning',   label: 'Cleaning & Household',emoji: '🧹' },
  { id: 'hygiene',    label: 'Toiletries & Health', emoji: '🧼' },
  { id: 'baby',       label: 'Baby & Toddler',     emoji: '👶' },
  { id: 'petfood',    label: 'Pet Food',            emoji: '🐾' },
];

// Format: { id, name, brand, category, price, unit, qty, emoji, barcode }
// price = typical UK supermarket price in £
// barcode = used to fetch real photo from Open Food Facts API

export const PRODUCTS = [

  // ── DAIRY & EGGS ──────────────────────────────────────────────────────────
  { id:'d1',  name:'Semi-skimmed Milk',        brand:'Cravendale',   category:'dairy',   price:1.45, unit:'2 pints',  emoji:'🥛', barcode:'5025628001006' },
  { id:'d2',  name:'Whole Milk',               brand:'Cravendale',   category:'dairy',   price:1.45, unit:'2 pints',  emoji:'🥛', barcode:'5025628001013' },
  { id:'d3',  name:'Semi-skimmed Milk',        brand:'Own Brand',    category:'dairy',   price:1.10, unit:'2 pints',  emoji:'🥛', barcode:'5000128032018' },
  { id:'d4',  name:'Whole Milk',               brand:'Own Brand',    category:'dairy',   price:1.10, unit:'2 pints',  emoji:'🥛', barcode:'5000128032025' },
  { id:'d5',  name:'Skimmed Milk',             brand:'Own Brand',    category:'dairy',   price:1.10, unit:'2 pints',  emoji:'🥛', barcode:'5000128032032' },
  { id:'d6',  name:'Oat Milk',                 brand:'Oatly',        category:'dairy',   price:1.80, unit:'1 litre',  emoji:'🥛', barcode:'7394376616027' },
  { id:'d7',  name:'Almond Milk Unsweetened',  brand:'Alpro',        category:'dairy',   price:1.65, unit:'1 litre',  emoji:'🥛', barcode:'5411188108108' },
  { id:'d8',  name:'Soya Milk',                brand:'Alpro',        category:'dairy',   price:1.60, unit:'1 litre',  emoji:'🥛', barcode:'5411188099337' },
  { id:'d9',  name:'Salted Butter',            brand:'Anchor',       category:'dairy',   price:2.25, unit:'250g',     emoji:'🧈', barcode:'5010151001016' },
  { id:'d10', name:'Unsalted Butter',          brand:'Anchor',       category:'dairy',   price:2.25, unit:'250g',     emoji:'🧈', barcode:'5010151001023' },
  { id:'d11', name:'Spreadable Butter',        brand:'Lurpak',       category:'dairy',   price:2.75, unit:'250g',     emoji:'🧈', barcode:'5740900612004' },
  { id:'d12', name:'Mature Cheddar',           brand:'Cathedral City',category:'dairy',  price:3.50, unit:'400g',     emoji:'🧀', barcode:'5000295133325' },
  { id:'d13', name:'Mild Cheddar',             brand:'Cathedral City',category:'dairy',  price:3.00, unit:'400g',     emoji:'🧀', barcode:'5000295133318' },
  { id:'d14', name:'Mozzarella',               brand:'Galbani',      category:'dairy',   price:1.60, unit:'125g',     emoji:'🧀', barcode:'8005800101018' },
  { id:'d15', name:'Greek Yoghurt',            brand:'Fage',         category:'dairy',   price:2.50, unit:'500g',     emoji:'🍶', barcode:'5200163511234' },
  { id:'d16', name:'Natural Yoghurt',          brand:'Yeo Valley',   category:'dairy',   price:2.00, unit:'500g',     emoji:'🍶', barcode:'5025042025017' },
  { id:'d17', name:'Free Range Eggs',          brand:'Happy Eggs',   category:'dairy',   price:3.00, unit:'6 pack',   emoji:'🥚', barcode:'5000295020831' },
  { id:'d18', name:'Free Range Eggs',          brand:'Own Brand',    category:'dairy',   price:2.50, unit:'6 pack',   emoji:'🥚', barcode:'5000128012115' },
  { id:'d19', name:'Free Range Eggs',          brand:'Own Brand',    category:'dairy',   price:4.50, unit:'12 pack',  emoji:'🥚', barcode:'5000128012122' },
  { id:'d20', name:'Soured Cream',             brand:'Own Brand',    category:'dairy',   price:0.90, unit:'150ml',    emoji:'🍶', barcode:'5000128201018' },
  { id:'d21', name:'Double Cream',             brand:'Own Brand',    category:'dairy',   price:1.20, unit:'300ml',    emoji:'🍶', barcode:'5000128201025' },
  { id:'d22', name:'Single Cream',             brand:'Own Brand',    category:'dairy',   price:0.95, unit:'300ml',    emoji:'🍶', barcode:'5000128201032' },
  { id:'d23', name:'Clotted Cream',            brand:'Own Brand',    category:'dairy',   price:1.75, unit:'113g',     emoji:'🍶', barcode:'5000128201049' },
  { id:'d24', name:'Cream Cheese',             brand:'Philadelphia', category:'dairy',   price:2.10, unit:'200g',     emoji:'🧀', barcode:'7622300489434' },

  // ── BREAD & BAKERY ────────────────────────────────────────────────────────
  { id:'b1',  name:'Medium Sliced White Bread',brand:'Hovis',        category:'bread',   price:1.40, unit:'800g',     emoji:'🍞', barcode:'5000336012536' },
  { id:'b2',  name:'Medium Sliced Brown Bread', brand:'Hovis',       category:'bread',   price:1.40, unit:'800g',     emoji:'🍞', barcode:'5000336012543' },
  { id:'b3',  name:'Wholemeal Bread',           brand:'Warburtons',  category:'bread',   price:1.60, unit:'800g',     emoji:'🍞', barcode:'5000169001016' },
  { id:'b4',  name:'White Bread Thick Sliced',  brand:'Warburtons',  category:'bread',   price:1.40, unit:'800g',     emoji:'🍞', barcode:'5000169001023' },
  { id:'b5',  name:'Seeded Batch Loaf',         brand:'Warburtons',  category:'bread',   price:1.75, unit:'400g',     emoji:'🍞', barcode:'5000169001030' },
  { id:'b6',  name:'White Rolls',               brand:'Own Brand',   category:'bread',   price:1.00, unit:'6 pack',   emoji:'🥖', barcode:'5000128301016' },
  { id:'b7',  name:'Burger Buns',               brand:'Own Brand',   category:'bread',   price:1.10, unit:'4 pack',   emoji:'🥖', barcode:'5000128301023' },
  { id:'b8',  name:'Bagels Plain',              brand:'New York Bagel',category:'bread',  price:1.50, unit:'5 pack',   emoji:'🥯', barcode:'5060174200018' },
  { id:'b9',  name:'Croissants',                brand:'Own Brand',   category:'bread',   price:1.75, unit:'4 pack',   emoji:'🥐', barcode:'5000128301030' },
  { id:'b10', name:'Pitta Bread',               brand:'Own Brand',   category:'bread',   price:1.00, unit:'6 pack',   emoji:'🫓', barcode:'5000128301047' },
  { id:'b11', name:'Naan Bread',                brand:'Own Brand',   category:'bread',   price:1.25, unit:'2 pack',   emoji:'🫓', barcode:'5000128301054' },
  { id:'b12', name:'Crumpets',                  brand:'Warburtons',  category:'bread',   price:1.15, unit:'6 pack',   emoji:'🫓', barcode:'5000169002016' },
  { id:'b13', name:'Wraps / Tortillas',         brand:'Mission',     category:'bread',   price:1.75, unit:'8 pack',   emoji:'🫓', barcode:'5000336030010' },
  { id:'b14', name:'Pain au Chocolat',          brand:'Own Brand',   category:'bread',   price:1.85, unit:'4 pack',   emoji:'🥐', barcode:'5000128301061' },

  // ── MEAT & FISH ───────────────────────────────────────────────────────────
  { id:'m1',  name:'Chicken Breast Fillets',    brand:'Own Brand',   category:'meat',    price:4.50, unit:'500g',     emoji:'🍗', barcode:'5000128401016' },
  { id:'m2',  name:'Chicken Thigh Fillets',     brand:'Own Brand',   category:'meat',    price:3.50, unit:'500g',     emoji:'🍗', barcode:'5000128401023' },
  { id:'m3',  name:'Beef Mince 5% Fat',         brand:'Own Brand',   category:'meat',    price:4.50, unit:'500g',     emoji:'🥩', barcode:'5000128401030' },
  { id:'m4',  name:'Beef Mince 20% Fat',        brand:'Own Brand',   category:'meat',    price:3.20, unit:'500g',     emoji:'🥩', barcode:'5000128401047' },
  { id:'m5',  name:'Pork Sausages',             brand:'Richmond',    category:'meat',    price:3.00, unit:'8 pack',   emoji:'🌭', barcode:'5010038120016' },
  { id:'m6',  name:'Smoked Back Bacon',         brand:'Own Brand',   category:'meat',    price:2.50, unit:'300g',     emoji:'🥓', barcode:'5000128401054' },
  { id:'m7',  name:'Unsmoked Back Bacon',       brand:'Own Brand',   category:'meat',    price:2.50, unit:'300g',     emoji:'🥓', barcode:'5000128401061' },
  { id:'m8',  name:'Cod Fillets',               brand:'Own Brand',   category:'meat',    price:4.00, unit:'300g',     emoji:'🐟', barcode:'5000128401078' },
  { id:'m9',  name:'Salmon Fillets',            brand:'Own Brand',   category:'meat',    price:5.00, unit:'2 pack',   emoji:'🐟', barcode:'5000128401085' },
  { id:'m10', name:'Tuna Steak',                brand:'Own Brand',   category:'meat',    price:4.50, unit:'2 pack',   emoji:'🐟', barcode:'5000128401092' },
  { id:'m11', name:'Prawns Cooked',             brand:'Own Brand',   category:'meat',    price:3.50, unit:'180g',     emoji:'🦐', barcode:'5000128401109' },
  { id:'m12', name:'Diced Chicken',             brand:'Own Brand',   category:'meat',    price:4.00, unit:'400g',     emoji:'🍗', barcode:'5000128401116' },
  { id:'m13', name:'Beef Steak Mince',          brand:'Own Brand',   category:'meat',    price:5.50, unit:'500g',     emoji:'🥩', barcode:'5000128401123' },
  { id:'m14', name:'Ham Wafer Thin',            brand:'Own Brand',   category:'meat',    price:2.00, unit:'125g',     emoji:'🥩', barcode:'5000128401130' },
  { id:'m15', name:'Chicken Drummers',          brand:'Own Brand',   category:'meat',    price:3.50, unit:'pack',     emoji:'🍗', barcode:'5000128401147' },

  // ── FRUIT & VEG ───────────────────────────────────────────────────────────
  { id:'f1',  name:'Bananas',                   brand:'Own Brand',   category:'fruit',   price:0.85, unit:'bunch ~5', emoji:'🍌', barcode:'5000128501016' },
  { id:'f2',  name:'Apples Gala',               brand:'Own Brand',   category:'fruit',   price:1.50, unit:'6 pack',   emoji:'🍎', barcode:'5000128501023' },
  { id:'f3',  name:'Apples Granny Smith',       brand:'Own Brand',   category:'fruit',   price:1.50, unit:'6 pack',   emoji:'🍏', barcode:'5000128501030' },
  { id:'f4',  name:'Strawberries',              brand:'Own Brand',   category:'fruit',   price:2.00, unit:'400g',     emoji:'🍓', barcode:'5000128501047' },
  { id:'f5',  name:'Blueberries',               brand:'Own Brand',   category:'fruit',   price:2.50, unit:'200g',     emoji:'🫐', barcode:'5000128501054' },
  { id:'f6',  name:'Grapes Red Seedless',       brand:'Own Brand',   category:'fruit',   price:2.50, unit:'500g',     emoji:'🍇', barcode:'5000128501061' },
  { id:'f7',  name:'Oranges',                   brand:'Own Brand',   category:'fruit',   price:2.00, unit:'4 pack',   emoji:'🍊', barcode:'5000128501078' },
  { id:'f8',  name:'Lemons',                    brand:'Own Brand',   category:'fruit',   price:0.70, unit:'each',     emoji:'🍋', barcode:'5000128501085' },
  { id:'f9',  name:'Avocado',                   brand:'Own Brand',   category:'fruit',   price:0.75, unit:'each',     emoji:'🥑', barcode:'5000128501092' },
  { id:'f10', name:'Baby Potatoes',             brand:'Own Brand',   category:'fruit',   price:1.50, unit:'1kg',      emoji:'🥔', barcode:'5000128501109' },
  { id:'f11', name:'White Potatoes',            brand:'Own Brand',   category:'fruit',   price:1.75, unit:'2kg',      emoji:'🥔', barcode:'5000128501116' },
  { id:'f12', name:'Sweet Potato',              brand:'Own Brand',   category:'fruit',   price:0.90, unit:'each',     emoji:'🍠', barcode:'5000128501123' },
  { id:'f13', name:'Broccoli',                  brand:'Own Brand',   category:'fruit',   price:0.80, unit:'each',     emoji:'🥦', barcode:'5000128501130' },
  { id:'f14', name:'Spinach',                   brand:'Own Brand',   category:'fruit',   price:1.00, unit:'200g',     emoji:'🥬', barcode:'5000128501147' },
  { id:'f15', name:'Mixed Salad Bag',           brand:'Own Brand',   category:'fruit',   price:1.00, unit:'bag',      emoji:'🥗', barcode:'5000128501154' },
  { id:'f16', name:'Carrots',                   brand:'Own Brand',   category:'fruit',   price:0.70, unit:'1kg',      emoji:'🥕', barcode:'5000128501161' },
  { id:'f17', name:'Onions White',              brand:'Own Brand',   category:'fruit',   price:0.90, unit:'1kg',      emoji:'🧅', barcode:'5000128501178' },
  { id:'f18', name:'Red Onions',                brand:'Own Brand',   category:'fruit',   price:1.00, unit:'500g',     emoji:'🧅', barcode:'5000128501185' },
  { id:'f19', name:'Garlic',                    brand:'Own Brand',   category:'fruit',   price:0.50, unit:'bulb',     emoji:'🧄', barcode:'5000128501192' },
  { id:'f20', name:'Tomatoes',                  brand:'Own Brand',   category:'fruit',   price:1.00, unit:'6 pack',   emoji:'🍅', barcode:'5000128501209' },
  { id:'f21', name:'Cherry Tomatoes',           brand:'Own Brand',   category:'fruit',   price:1.25, unit:'250g',     emoji:'🍅', barcode:'5000128501216' },
  { id:'f22', name:'Cucumber',                  brand:'Own Brand',   category:'fruit',   price:0.65, unit:'each',     emoji:'🥒', barcode:'5000128501223' },
  { id:'f23', name:'Courgette',                 brand:'Own Brand',   category:'fruit',   price:0.60, unit:'each',     emoji:'🥒', barcode:'5000128501230' },
  { id:'f24', name:'Peppers Mixed',             brand:'Own Brand',   category:'fruit',   price:1.50, unit:'3 pack',   emoji:'🫑', barcode:'5000128501247' },
  { id:'f25', name:'Mushrooms Closed Cup',      brand:'Own Brand',   category:'fruit',   price:1.00, unit:'300g',     emoji:'🍄', barcode:'5000128501254' },
  { id:'f26', name:'Iceberg Lettuce',           brand:'Own Brand',   category:'fruit',   price:0.80, unit:'each',     emoji:'🥬', barcode:'5000128501261' },
  { id:'f27', name:'Celery',                    brand:'Own Brand',   category:'fruit',   price:0.90, unit:'each',     emoji:'🥬', barcode:'5000128501278' },
  { id:'f28', name:'Leek',                      brand:'Own Brand',   category:'fruit',   price:0.75, unit:'each',     emoji:'🥬', barcode:'5000128501285' },
  { id:'f29', name:'Kiwi Fruit',                brand:'Own Brand',   category:'fruit',   price:1.50, unit:'4 pack',   emoji:'🥝', barcode:'5000128501292' },
  { id:'f30', name:'Mango',                     brand:'Own Brand',   category:'fruit',   price:0.85, unit:'each',     emoji:'🥭', barcode:'5000128501309' },

  // ── TINNED & JARRED ───────────────────────────────────────────────────────
  { id:'t1',  name:'Baked Beans',               brand:'Heinz',       category:'tinned',  price:0.90, unit:'415g',     emoji:'🥫', barcode:'0000003000009' },
  { id:'t2',  name:'Baked Beans No Sugar',      brand:'Heinz',       category:'tinned',  price:0.95, unit:'415g',     emoji:'🥫', barcode:'0000003000016' },
  { id:'t3',  name:'Chopped Tomatoes',          brand:'Napolina',    category:'tinned',  price:0.70, unit:'400g',     emoji:'🥫', barcode:'5000118191018' },
  { id:'t4',  name:'Chopped Tomatoes',          brand:'Own Brand',   category:'tinned',  price:0.40, unit:'400g',     emoji:'🥫', barcode:'5000128601016' },
  { id:'t5',  name:'Tuna in Brine',             brand:'John West',   category:'tinned',  price:1.25, unit:'160g',     emoji:'🥫', barcode:'0000019876543' },
  { id:'t6',  name:'Tuna in Sunflower Oil',     brand:'John West',   category:'tinned',  price:1.25, unit:'160g',     emoji:'🥫', barcode:'0000019876550' },
  { id:'t7',  name:'Tuna Multipack',            brand:'John West',   category:'tinned',  price:3.50, unit:'4 x 145g', emoji:'🥫', barcode:'0000019876567' },
  { id:'t8',  name:'Chicken in Brine',          brand:'Princes',     category:'tinned',  price:1.60, unit:'213g',     emoji:'🥫', barcode:'5000232101016' },
  { id:'t9',  name:'Sweetcorn',                 brand:'Green Giant', category:'tinned',  price:0.80, unit:'340g',     emoji:'🌽', barcode:'0000005000000' },
  { id:'t10', name:'Mixed Beans',               brand:'Own Brand',   category:'tinned',  price:0.55, unit:'400g',     emoji:'🥫', barcode:'5000128601023' },
  { id:'t11', name:'Kidney Beans',              brand:'Own Brand',   category:'tinned',  price:0.55, unit:'400g',     emoji:'🥫', barcode:'5000128601030' },
  { id:'t12', name:'Chickpeas',                 brand:'Own Brand',   category:'tinned',  price:0.55, unit:'400g',     emoji:'🥫', barcode:'5000128601047' },
  { id:'t13', name:'Coconut Milk',              brand:'Chaokoh',     category:'tinned',  price:1.30, unit:'400ml',    emoji:'🥫', barcode:'8850019105015' },
  { id:'t14', name:'Lentils',                   brand:'Own Brand',   category:'tinned',  price:0.55, unit:'400g',     emoji:'🥫', barcode:'5000128601054' },
  { id:'t15', name:'Sardines in Tomato Sauce',  brand:'John West',   category:'tinned',  price:0.90, unit:'120g',     emoji:'🥫', barcode:'0000019876574' },
  { id:'t16', name:'Tomato Soup',               brand:'Heinz',       category:'tinned',  price:1.00, unit:'400g',     emoji:'🥫', barcode:'0000003000023' },
  { id:'t17', name:'Mulligatawny Soup',         brand:'Heinz',       category:'tinned',  price:1.10, unit:'400g',     emoji:'🥫', barcode:'0000003000030' },

  // ── PASTA, RICE & GRAINS ──────────────────────────────────────────────────
  { id:'p1',  name:'Spaghetti',                 brand:'Napolina',    category:'pasta',   price:1.00, unit:'500g',     emoji:'🍝', barcode:'5000118101016' },
  { id:'p2',  name:'Penne',                     brand:'Napolina',    category:'pasta',   price:1.00, unit:'500g',     emoji:'🍝', barcode:'5000118101023' },
  { id:'p3',  name:'Fusilli',                   brand:'Napolina',    category:'pasta',   price:1.00, unit:'500g',     emoji:'🍝', barcode:'5000118101030' },
  { id:'p4',  name:'Macaroni',                  brand:'Own Brand',   category:'pasta',   price:0.75, unit:'500g',     emoji:'🍝', barcode:'5000128701016' },
  { id:'p5',  name:'Basmati Rice',              brand:'Tilda',       category:'pasta',   price:3.50, unit:'1kg',      emoji:'🍚', barcode:'5011157009017' },
  { id:'p6',  name:'Easy Cook Long Grain Rice', brand:'Own Brand',   category:'pasta',   price:0.90, unit:'1kg',      emoji:'🍚', barcode:'5000128701023' },
  { id:'p7',  name:'Arborio Risotto Rice',      brand:'Napolina',    category:'pasta',   price:1.50, unit:'500g',     emoji:'🍚', barcode:'5000118101047' },
  { id:'p8',  name:'Egg Noodles',               brand:'Sharwoods',   category:'pasta',   price:1.40, unit:'300g',     emoji:'🍜', barcode:'0000000000001' },
  { id:'p9',  name:'Porridge Oats',             brand:'Quaker',      category:'pasta',   price:2.00, unit:'1kg',      emoji:'🥣', barcode:'5000347022017' },
  { id:'p10', name:'Rolled Oats',               brand:'Own Brand',   category:'pasta',   price:1.10, unit:'1kg',      emoji:'🥣', barcode:'5000128701030' },
  { id:'p11', name:'Couscous',                  brand:'Own Brand',   category:'pasta',   price:1.00, unit:'500g',     emoji:'🍚', barcode:'5000128701047' },
  { id:'p12', name:'Bulgar Wheat',              brand:'Own Brand',   category:'pasta',   price:1.25, unit:'500g',     emoji:'🌾', barcode:'5000128701054' },
  { id:'p13', name:'Quinoa',                    brand:'Own Brand',   category:'pasta',   price:2.50, unit:'300g',     emoji:'🌾', barcode:'5000128701061' },
  { id:'p14', name:'Microwave Rice Pilau',      brand:'Uncle Bens',  category:'pasta',   price:1.50, unit:'250g',     emoji:'🍚', barcode:'5000232201016' },
  { id:'p15', name:'Plain Flour',               brand:'Allinson',    category:'pasta',   price:1.40, unit:'1.5kg',    emoji:'🌾', barcode:'5000236030016' },
  { id:'p16', name:'Self Raising Flour',        brand:'Allinson',    category:'pasta',   price:1.40, unit:'1.5kg',    emoji:'🌾', barcode:'5000236030023' },
  { id:'p17', name:'Caster Sugar',              brand:'Silver Spoon',category:'pasta',   price:1.80, unit:'1kg',      emoji:'🍬', barcode:'5000128701078' },
  { id:'p18', name:'Granulated Sugar',          brand:'Silver Spoon',category:'pasta',   price:1.60, unit:'1kg',      emoji:'🍬', barcode:'5000128701085' },

  // ── CEREALS & BREAKFAST ───────────────────────────────────────────────────
  { id:'c1',  name:'Cornflakes',                brand:'Kelloggs',    category:'cereal',  price:2.50, unit:'500g',     emoji:'🥣', barcode:'5000218001017' },
  { id:'c2',  name:'Rice Krispies',             brand:'Kelloggs',    category:'cereal',  price:2.50, unit:'510g',     emoji:'🥣', barcode:'5000218001024' },
  { id:'c3',  name:'Coco Pops',                 brand:'Kelloggs',    category:'cereal',  price:3.00, unit:'480g',     emoji:'🥣', barcode:'5000218001031' },
  { id:'c4',  name:'Cheerios',                  brand:'Nestle',      category:'cereal',  price:2.75, unit:'375g',     emoji:'🥣', barcode:'7613035115705' },
  { id:'c5',  name:'Weetabix',                  brand:'Weetabix',    category:'cereal',  price:2.80, unit:'24 pack',  emoji:'🥣', barcode:'5010029000119' },
  { id:'c6',  name:'Shreddies',                 brand:'Nestle',      category:'cereal',  price:2.75, unit:'500g',     emoji:'🥣', barcode:'7613035115712' },
  { id:'c7',  name:'Special K',                 brand:'Kelloggs',    category:'cereal',  price:3.00, unit:'500g',     emoji:'🥣', barcode:'5000218001048' },
  { id:'c8',  name:'Granola',                   brand:'Jordans',     category:'cereal',  price:3.50, unit:'500g',     emoji:'🥣', barcode:'5000169101016' },
  { id:'c9',  name:'Muesli',                    brand:'Own Brand',   category:'cereal',  price:2.00, unit:'1kg',      emoji:'🥣', barcode:'5000128801016' },

  // ── DRINKS & JUICE ────────────────────────────────────────────────────────
  { id:'dr1', name:'Orange Juice (Not From Concentrate)',brand:'Tropicana',category:'drinks',price:2.50,unit:'1L',    emoji:'🧃', barcode:'5000128901016' },
  { id:'dr2', name:'Orange Juice',              brand:'Own Brand',   category:'drinks',  price:1.10, unit:'1L',       emoji:'🧃', barcode:'5000128901023' },
  { id:'dr3', name:'Apple Juice',               brand:'Own Brand',   category:'drinks',  price:1.00, unit:'1L',       emoji:'🧃', barcode:'5000128901030' },
  { id:'dr4', name:'Ribena Blackcurrant',       brand:'Ribena',      category:'drinks',  price:2.00, unit:'500ml',    emoji:'🧃', barcode:'5000128901047' },
  { id:'dr5', name:'Coca-Cola',                 brand:'Coca-Cola',   category:'drinks',  price:1.85, unit:'1.5L',     emoji:'🥤', barcode:'5449000054227' },
  { id:'dr6', name:'Diet Coke',                 brand:'Coca-Cola',   category:'drinks',  price:1.85, unit:'1.5L',     emoji:'🥤', barcode:'5449000131805' },
  { id:'dr7', name:'Pepsi Max',                 brand:'Pepsi',       category:'drinks',  price:1.85, unit:'1.5L',     emoji:'🥤', barcode:'4009900483148' },
  { id:'dr8', name:'Lemonade',                  brand:'Own Brand',   category:'drinks',  price:0.55, unit:'2L',       emoji:'🥤', barcode:'5000128901054' },
  { id:'dr9', name:'Sparkling Water',           brand:'Buxton',      category:'drinks',  price:0.75, unit:'1.5L',     emoji:'💧', barcode:'5000259127022' },
  { id:'dr10',name:'Still Water',               brand:'Buxton',      category:'drinks',  price:0.55, unit:'1.5L',     emoji:'💧', barcode:'5000259127039' },
  { id:'dr11',name:'Coffee Instant',            brand:'Nescafe Gold', category:'drinks', price:5.00, unit:'200g',     emoji:'☕', barcode:'4005808206872' },
  { id:'dr12',name:'Coffee Instant Original',   brand:'Nescafe',     category:'drinks',  price:3.50, unit:'200g',     emoji:'☕', barcode:'4005808206889' },
  { id:'dr13',name:'Tea Bags',                  brand:'PG Tips',     category:'drinks',  price:3.50, unit:'80 bags',  emoji:'🍵', barcode:'8714100724255' },
  { id:'dr14',name:'Tea Bags',                  brand:'Yorkshire Tea',category:'drinks', price:4.00, unit:'80 bags',  emoji:'🍵', barcode:'5010664001017' },
  { id:'dr15',name:'Herbal Tea Camomile',       brand:'Twinings',    category:'drinks',  price:2.00, unit:'20 bags',  emoji:'🍵', barcode:'0070177154517' },
  { id:'dr16',name:'Lucozade Sport Orange',     brand:'Lucozade',    category:'drinks',  price:1.50, unit:'500ml',    emoji:'🥤', barcode:'5000128901061' },
  { id:'dr17',name:'Red Bull Energy Drink',     brand:'Red Bull',    category:'drinks',  price:1.50, unit:'250ml',    emoji:'🥤', barcode:'90162980' },

  // ── SAUCES & CONDIMENTS ───────────────────────────────────────────────────
  { id:'s1',  name:'Tomato Ketchup',            brand:'Heinz',       category:'condiments',price:2.50,unit:'700g',   emoji:'🍅', barcode:'0000003000047' },
  { id:'s2',  name:'Mayonnaise',                brand:'Hellmanns',   category:'condiments',price:2.80,unit:'400ml',  emoji:'🍶', barcode:'8710908893636' },
  { id:'s3',  name:'Brown Sauce',               brand:'HP',          category:'condiments',price:2.00,unit:'425g',   emoji:'🍶', barcode:'8716200010025' },
  { id:'s4',  name:'Malt Vinegar',              brand:'Sarson\'s',   category:'condiments',price:1.00,unit:'400ml',  emoji:'🍶', barcode:'5010119005016' },
  { id:'s5',  name:'Olive Oil Extra Virgin',    brand:'Napolina',    category:'condiments',price:4.50,unit:'500ml',  emoji:'🫙', barcode:'5000118201016' },
  { id:'s6',  name:'Vegetable Oil',             brand:'Own Brand',   category:'condiments',price:1.80,unit:'1L',     emoji:'🫙', barcode:'5000128101016' },
  { id:'s7',  name:'Soy Sauce',                 brand:'Kikkoman',    category:'condiments',price:2.50,unit:'150ml',  emoji:'🫙', barcode:'4100420202018' },
  { id:'s8',  name:'Worcestershire Sauce',      brand:'Lea & Perrins',category:'condiments',price:2.00,unit:'150ml',emoji:'🫙', barcode:'0000054593209' },
  { id:'s9',  name:'Pasta Sauce Tomato & Basil',brand:'Dolmio',      category:'condiments',price:1.80,unit:'500g',   emoji:'🫙', barcode:'5000128101023' },
  { id:'s10', name:'Curry Sauce',               brand:'Loyd Grossman',category:'condiments',price:2.00,unit:'350g',  emoji:'🫙', barcode:'5000128101030' },
  { id:'s11', name:'Salt',                      brand:'Saxa',        category:'condiments',price:0.75,unit:'750g',   emoji:'🧂', barcode:'5000128101047' },
  { id:'s12', name:'Black Pepper',              brand:'Own Brand',   category:'condiments',price:1.00,unit:'100g',   emoji:'🫙', barcode:'5000128101054' },
  { id:'s13', name:'Mixed Herbs',               brand:'Own Brand',   category:'condiments',price:0.85,unit:'10g',    emoji:'🌿', barcode:'5000128101061' },
  { id:'s14', name:'Paprika',                   brand:'Own Brand',   category:'condiments',price:0.85,unit:'50g',    emoji:'🌶️', barcode:'5000128101078' },
  { id:'s15', name:'Cumin',                     brand:'Own Brand',   category:'condiments',price:0.85,unit:'50g',    emoji:'🌿', barcode:'5000128101085' },
  { id:'s16', name:'Turmeric',                  brand:'Own Brand',   category:'condiments',price:0.85,unit:'50g',    emoji:'🌿', barcode:'5000128101092' },
  { id:'s17', name:'Sriracha Sauce',            brand:'Tabasco',     category:'condiments',price:2.50,unit:'250ml',  emoji:'🌶️', barcode:'5000128101109' },
  { id:'s18', name:'Peanut Butter Smooth',      brand:'Skippy',      category:'condiments',price:2.50,unit:'340g',   emoji:'🥜', barcode:'0037600100526' },
  { id:'s19', name:'Jam Strawberry',            brand:'Bonne Maman', category:'condiments',price:3.00,unit:'370g',   emoji:'🍓', barcode:'3608580831306' },
  { id:'s20', name:'Marmalade',                 brand:'Robertsons',  category:'condiments',price:2.00,unit:'454g',   emoji:'🍊', barcode:'5000128101116' },
  { id:'s21', name:'Honey',                     brand:'Own Brand',   category:'condiments',price:2.50,unit:'340g',   emoji:'🍯', barcode:'5000128101123' },
  { id:'s22', name:'Nutella',                   brand:'Ferrero',     category:'condiments',price:3.00,unit:'400g',   emoji:'🫙', barcode:'3017620422003' },
  { id:'s23', name:'Stock Cubes Beef',          brand:'Oxo',         category:'condiments',price:1.50,unit:'12 pack',emoji:'🫙', barcode:'7622210049018' },
  { id:'s24', name:'Stock Cubes Chicken',       brand:'Oxo',         category:'condiments',price:1.50,unit:'12 pack',emoji:'🫙', barcode:'7622210049025' },

  // ── SNACKS ────────────────────────────────────────────────────────────────
  { id:'sn1', name:'Ready Salted Crisps',       brand:'Walkers',     category:'snacks',  price:1.50, unit:'6 pack',   emoji:'🍿', barcode:'5000328100017' },
  { id:'sn2', name:'Salt & Vinegar Crisps',     brand:'Walkers',     category:'snacks',  price:1.50, unit:'6 pack',   emoji:'🍿', barcode:'5000328100024' },
  { id:'sn3', name:'Cheese & Onion Crisps',     brand:'Walkers',     category:'snacks',  price:1.50, unit:'6 pack',   emoji:'🍿', barcode:'5000328100031' },
  { id:'sn4', name:'Pringles Original',         brand:'Pringles',    category:'snacks',  price:2.50, unit:'165g',     emoji:'🍿', barcode:'0038000845222' },
  { id:'sn5', name:'Hobnobs',                   brand:'McVities',    category:'snacks',  price:1.50, unit:'300g',     emoji:'🍪', barcode:'5000168002016' },
  { id:'sn6', name:'Digestive Biscuits',        brand:'McVities',    category:'snacks',  price:1.40, unit:'400g',     emoji:'🍪', barcode:'5000168002023' },
  { id:'sn7', name:'Rich Tea Biscuits',         brand:'McVities',    category:'snacks',  price:1.20, unit:'300g',     emoji:'🍪', barcode:'5000168002030' },
  { id:'sn8', name:'Jaffa Cakes',               brand:'McVities',    category:'snacks',  price:1.50, unit:'10 pack',  emoji:'🍪', barcode:'5000168002047' },
  { id:'sn9', name:'KitKat',                    brand:'Nestle',      category:'snacks',  price:2.00, unit:'4 pack',   emoji:'🍫', barcode:'5000128201016' },
  { id:'sn10',name:'Maltesers',                 brand:'Mars',        category:'snacks',  price:2.00, unit:'120g',     emoji:'🍫', barcode:'5000159465489' },
  { id:'sn11',name:'Haribo Starmix',            brand:'Haribo',      category:'snacks',  price:1.25, unit:'200g',     emoji:'🍬', barcode:'4001686511145' },
  { id:'sn12',name:'Nakd Cocoa Orange Bar',     brand:'Nakd',        category:'snacks',  price:1.20, unit:'35g',      emoji:'🍫', barcode:'5060088907016' },

  // ── FROZEN ────────────────────────────────────────────────────────────────
  { id:'fz1', name:'Oven Chips',                brand:'McCain',      category:'frozen',  price:2.50, unit:'1kg',      emoji:'🍟', barcode:'5000132219018' },
  { id:'fz2', name:'Peas',                      brand:'Birds Eye',   category:'frozen',  price:1.75, unit:'900g',     emoji:'🫛', barcode:'5000394010017' },
  { id:'fz3', name:'Fish Fingers',              brand:'Birds Eye',   category:'frozen',  price:3.00, unit:'12 pack',  emoji:'🐟', barcode:'5000394010024' },
  { id:'fz4', name:'Pizza Margherita',          brand:'Dr Oetker',   category:'frozen',  price:3.00, unit:'each',     emoji:'🍕', barcode:'4001724016006' },
  { id:'fz5', name:'Chicken Nuggets',           brand:'Own Brand',   category:'frozen',  price:3.00, unit:'500g',     emoji:'🍗', barcode:'5000128201023' },
  { id:'fz6', name:'Ice Cream Vanilla',         brand:'Walls',       category:'frozen',  price:3.50, unit:'1L',       emoji:'🍦', barcode:'8714100724262' },
  { id:'fz7', name:'Hash Browns',               brand:'McCain',      category:'frozen',  price:2.00, unit:'pack',     emoji:'🥔', barcode:'5000132219025' },
  { id:'fz8', name:'Garlic Bread Baguette',     brand:'Own Brand',   category:'frozen',  price:1.50, unit:'pack',     emoji:'🥖', barcode:'5000128201030' },

  // ── CLEANING & HOUSEHOLD ─────────────────────────────────────────────────
  { id:'cl1', name:'Washing Up Liquid',         brand:'Fairy',       category:'cleaning',price:2.50, unit:'900ml',    emoji:'🫧', barcode:'8001090302618' },
  { id:'cl2', name:'Washing Up Liquid Original',brand:'Fairy',       category:'cleaning',price:1.80, unit:'433ml',    emoji:'🫧', barcode:'8001090302625' },
  { id:'cl3', name:'Washing Powder',            brand:'Ariel',       category:'cleaning',price:8.00, unit:'40 washes',emoji:'🧺', barcode:'8001090300032' },
  { id:'cl4', name:'Washing Liquid',            brand:'Persil',      category:'cleaning',price:7.50, unit:'38 washes',emoji:'🧺', barcode:'8710908893643' },
  { id:'cl5', name:'Fabric Softener',           brand:'Lenor',       category:'cleaning',price:4.00, unit:'66 washes',emoji:'🧴', barcode:'8001090380012' },
  { id:'cl6', name:'Dishwasher Tablets',        brand:'Finish',      category:'cleaning',price:6.00, unit:'40 pack',  emoji:'🍽️', barcode:'5900627048414' },
  { id:'cl7', name:'Multi-Surface Spray',       brand:'Flash',       category:'cleaning',price:2.50, unit:'800ml',    emoji:'🧴', barcode:'8001090378019' },
  { id:'cl8', name:'Bleach',                    brand:'Own Brand',   category:'cleaning',price:0.90, unit:'1L',       emoji:'🧴', barcode:'5000128301016' },
  { id:'cl9', name:'Toilet Roll',               brand:'Andrex',      category:'cleaning',price:5.00, unit:'9 pack',   emoji:'🧻', barcode:'5000128301023' },
  { id:'cl10',name:'Toilet Roll',               brand:'Own Brand',   category:'cleaning',price:3.50, unit:'9 pack',   emoji:'🧻', barcode:'5000128301030' },
  { id:'cl11',name:'Kitchen Roll',              brand:'Plenty',      category:'cleaning',price:3.50, unit:'3 pack',   emoji:'🧻', barcode:'5000128301047' },
  { id:'cl12',name:'Bin Bags',                  brand:'Own Brand',   category:'cleaning',price:2.50, unit:'20 pack',  emoji:'🗑️', barcode:'5000128301054' },
  { id:'cl13',name:'Cling Film',                brand:'Own Brand',   category:'cleaning',price:1.50, unit:'roll',     emoji:'📦', barcode:'5000128301061' },
  { id:'cl14',name:'Aluminium Foil',            brand:'Own Brand',   category:'cleaning',price:1.50, unit:'roll',     emoji:'📦', barcode:'5000128301078' },
  { id:'cl15',name:'Washing Up Gloves',         brand:'Marigold',    category:'cleaning',price:2.50, unit:'pair',     emoji:'🧤', barcode:'5000128301085' },

  // ── TOILETRIES & HEALTH ───────────────────────────────────────────────────
  { id:'h1',  name:'Toothpaste',                brand:'Colgate',     category:'hygiene', price:2.50, unit:'100ml',    emoji:'🪥', barcode:'8714789920016' },
  { id:'h2',  name:'Toothbrush',                brand:'Oral B',      category:'hygiene', price:2.50, unit:'each',     emoji:'🪥', barcode:'3014260073428' },
  { id:'h3',  name:'Shampoo',                   brand:'Head & Shoulders',category:'hygiene',price:4.00,unit:'400ml', emoji:'🧴', barcode:'5000174116018' },
  { id:'h4',  name:'Conditioner',               brand:'VO5',         category:'hygiene', price:2.00, unit:'250ml',    emoji:'🧴', barcode:'5000128401154' },
  { id:'h5',  name:'Shower Gel',                brand:'Radox',       category:'hygiene', price:2.50, unit:'500ml',    emoji:'🚿', barcode:'5000128401161' },
  { id:'h6',  name:'Deodorant Roll-On',         brand:'Sure',        category:'hygiene', price:2.50, unit:'50ml',     emoji:'🧴', barcode:'8710522616018' },
  { id:'h7',  name:'Deodorant Spray',           brand:'Lynx Africa',  category:'hygiene', price:3.00, unit:'150ml',   emoji:'🧴', barcode:'8710908893667' },
  { id:'h8',  name:'Razors',                    brand:'Gillette',    category:'hygiene', price:5.00, unit:'4 pack',   emoji:'🪒', barcode:'7702018877218' },
  { id:'h9',  name:'Paracetamol 500mg',         brand:'Panadol',     category:'hygiene', price:2.50, unit:'16 tabs',  emoji:'💊', barcode:'5000168206016' },
  { id:'h10', name:'Ibuprofen 200mg',           brand:'Nurofen',     category:'hygiene', price:2.50, unit:'16 tabs',  emoji:'💊', barcode:'5000168208010' },
  { id:'h11', name:'Plasters Assorted',         brand:'Elastoplast', category:'hygiene', price:3.00, unit:'40 pack',  emoji:'🩹', barcode:'4049500202016' },
  { id:'h12', name:'Hand Wash',                 brand:'Carex',       category:'hygiene', price:1.80, unit:'250ml',    emoji:'🧼', barcode:'5000168304016' },
  { id:'h13', name:'Hand Sanitiser',            brand:'Carex',       category:'hygiene', price:2.00, unit:'300ml',    emoji:'🧴', barcode:'5000168304023' },
  { id:'h14', name:'Sanitary Towels',           brand:'Always',      category:'hygiene', price:3.00, unit:'12 pack',  emoji:'🩸', barcode:'4015400040415' },
  { id:'h15', name:'Tampons Regular',           brand:'Tampax',      category:'hygiene', price:3.00, unit:'20 pack',  emoji:'🩸', barcode:'4015400040422' },
  { id:'h16', name:'Moisturiser',               brand:'Nivea',       category:'hygiene', price:3.50, unit:'200ml',    emoji:'🧴', barcode:'4005808206896' },
  { id:'h17', name:'Cotton Buds',               brand:'Own Brand',   category:'hygiene', price:1.00, unit:'200 pack', emoji:'🧹', barcode:'5000128401168' },
  { id:'h18', name:'Cotton Wool Pads',          brand:'Own Brand',   category:'hygiene', price:1.50, unit:'100 pack', emoji:'🧹', barcode:'5000128401175' },
  { id:'h19', name:'Baby Wipes',                brand:'WaterWipes',  category:'hygiene', price:3.00, unit:'60 pack',  emoji:'🧻', barcode:'5099514101012' },

  // ── BABY & TODDLER ────────────────────────────────────────────────────────
  { id:'ba1', name:'Nappies Size 1',            brand:'Pampers',     category:'baby',    price:6.00, unit:'27 pack',  emoji:'👶', barcode:'4015400040439' },
  { id:'ba2', name:'Nappies Size 3',            brand:'Pampers',     category:'baby',    price:8.00, unit:'30 pack',  emoji:'👶', barcode:'4015400040446' },
  { id:'ba3', name:'Nappies Size 4',            brand:'Pampers',     category:'baby',    price:9.00, unit:'28 pack',  emoji:'👶', barcode:'4015400040453' },
  { id:'ba4', name:'Baby Milk Formula Stage 1', brand:'Aptamil',     category:'baby',    price:12.00,unit:'800g',     emoji:'🍼', barcode:'5051594030016' },
  { id:'ba5', name:'Baby Food Puree',           brand:'Ella\'s Kitchen',category:'baby', price:1.80, unit:'120g',     emoji:'🍼', barcode:'5060107330016' },
  { id:'ba6', name:'Wet Wipes',                 brand:'Huggies',     category:'baby',    price:3.50, unit:'56 pack',  emoji:'🧻', barcode:'5029053556116' },

  // ── PET FOOD ──────────────────────────────────────────────────────────────
  { id:'pe1', name:'Dog Food Chicken',          brand:'Pedigree',    category:'petfood', price:7.00, unit:'12 x 100g',emoji:'🐶', barcode:'5010394016018' },
  { id:'pe2', name:'Cat Food Tuna',             brand:'Whiskas',     category:'petfood', price:5.00, unit:'12 x 85g', emoji:'🐱', barcode:'5010394116018' },
  { id:'pe3', name:'Dog Dry Food',              brand:'Bakers',      category:'petfood', price:6.00, unit:'1.1kg',    emoji:'🐶', barcode:'5010394216018' },
  { id:'pe4', name:'Cat Dry Food',              brand:'Felix',       category:'petfood', price:5.00, unit:'2kg',      emoji:'🐱', barcode:'5010394316018' },
];

// ── Search function ────────────────────────────────────────────────────────
export function searchProducts(query, limit = 8) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase().trim();
  return PRODUCTS
    .filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    )
    .sort((a, b) => {
      // Exact name match first
      const aName = a.name.toLowerCase().startsWith(q) ? 0 : 1;
      const bName = b.name.toLowerCase().startsWith(q) ? 0 : 1;
      return aName - bName;
    })
    .slice(0, limit);
}

export function getByCategory(categoryId, limit = 12) {
  return PRODUCTS.filter(p => p.category === categoryId).slice(0, limit);
}

// Open Food Facts image URL (CC-BY-SA — free to use)
export function getProductImageUrl(barcode) {
  if (!barcode) return null;
  const code = String(barcode).padStart(13, '0');
  const dir1 = code.slice(0, 3);
  const dir2 = code.slice(3, 6);
  const dir3 = code.slice(6, 9);
  return `https://images.openfoodfacts.org/images/products/${dir1}/${dir2}/${dir3}/${code}/front_en.8.400.jpg`;
}
