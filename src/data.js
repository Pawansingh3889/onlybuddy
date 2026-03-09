export const ERRAND_TYPES = [
  { id:'grocery',  icon:'🛒', label:'Grocery Run',       color:'#16A34A', desc:'Any supermarket or local shop in Hull', ex:'e.g. Milk, bread, eggs from Tesco'  },
  { id:'buy',      icon:'🛍️', label:'Buy & Deliver',      color:'#2563EB', desc:'Send a Buddy to any shop for anything', ex:'e.g. iPhone case from Argos'        },
  { id:'queue',    icon:'⏳', label:'Queue for Me',       color:'#D97706', desc:'Hold your spot in any queue in Hull',   ex:'e.g. Hold my spot at DVLA office'    },
  { id:'parcel',   icon:'📦', label:'Parcel & Returns',   color:'#7C3AED', desc:'Collect or drop off parcels anywhere',  ex:'e.g. Return shoes to Next, Hessle Rd'},
  { id:'pharmacy', icon:'💊', label:'Prescription Run',   color:'#DC2626', desc:'Collect prescriptions or pharmacy items', ex:'e.g. Collect from Boots Prospect St'},
  { id:'other',    icon:'⚡', label:'Custom Errand',      color:'#0891B2', desc:'Any other task — just describe it',     ex:'e.g. Print documents at library'    },
];

export const MOCK_RUNNERS = [
  { id:1, name:'Marcus T.',  avatar:'🧑‍🦱', rating:4.98, tasks:847, zone:'HU5–HU6', eta:6,  online:true,  badge:'⭐ Elite'  },
  { id:2, name:'Priya S.',   avatar:'👩‍🦰', rating:4.96, tasks:512, zone:'HU1–HU3', eta:9,  online:true,  badge:null       },
  { id:3, name:'Jamie L.',   avatar:'🧑‍🦲', rating:4.91, tasks:234, zone:'HU5–HU8', eta:14, online:true,  badge:'🆕 Rising' },
  { id:4, name:'Aisha M.',   avatar:'👩‍🦱', rating:4.99, tasks:1024,zone:'Hull City',eta:4,  online:true,  badge:'👑 Top'   },
  { id:5, name:'Tom B.',     avatar:'🧑',   rating:4.87, tasks:178, zone:'HU4–HU5', eta:18, online:false, badge:null       },
  { id:6, name:'Sophie K.',  avatar:'👩',   rating:4.94, tasks:391, zone:'HU2–HU4', eta:11, online:true,  badge:null       },
];

export const MOCK_ORDERS = [
  { id:'OB001', type:'grocery',  title:'Weekly Tesco Shop',            customer:'Pawan S.',   runner:'Marcus T.', address:'12 Newland Ave, HU5', time:'2m ago',   status:'in_progress', total:12.50 },
  { id:'OB002', type:'pharmacy', title:'Prescription — Boots Hull',    customer:'Linda K.',   runner:'Priya S.',  address:'45 Beverley Rd, HU5', time:'14m ago',  status:'delivered',   total:5.00  },
  { id:'OB003', type:'parcel',   title:'Return to Argos — Hull City',  customer:'James O.',   runner:'Aisha M.',  address:'St Stephens, HU1',    time:'1h ago',   status:'delivered',   total:6.50  },
  { id:'OB004', type:'buy',      title:'Pick up from Sports Direct',   customer:'Riya P.',    runner:'Jamie L.',  address:'Hessle Rd, HU3',       time:'2h ago',   status:'placed',      total:8.00  },
  { id:'OB005', type:'queue',    title:'Queue at Hull DVLA Office',    customer:'Steve H.',   runner:'Sophie K.', address:'Clough Rd, HU6',       time:'3h ago',   status:'delivered',   total:15.00 },
  { id:'OB006', type:'grocery',  title:'Aldi Shop — 8 items',          customer:'Amy T.',     runner:'Marcus T.', address:'Analby Common, HU4',   time:'5h ago',   status:'delivered',   total:9.50  },
];

export const TRACK_STEPS = [
  { icon:'✅', label:'Buddy accepted',          sub:'Confirmed just now'       },
  { icon:'🚴', label:'Buddy on the way',         sub:'Heading to pick-up point' },
  { icon:'🛒', label:'Collecting your items',    sub:'At the shop now'          },
  { icon:'📦', label:'Heading to you',           sub:'En route to your address' },
  { icon:'🎉', label:'Delivered!',               sub:'Task complete'            },
];

export const CHAT_MESSAGES = [
  { id:1, from:'runner',   text:"I'm on my way to Tesco now! 🚴",                    time:'2:14 PM' },
  { id:2, from:'customer', text:"Great! Can you also grab some orange juice please?", time:'2:15 PM' },
  { id:3, from:'runner',   text:"Of course, no problem! Any preference on brand?",    time:'2:15 PM' },
  { id:4, from:'customer', text:"Tropicana if they have it, otherwise any is fine 😊", time:'2:16 PM' },
];
