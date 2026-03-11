export const ERRAND_TYPES = [
  { id: 'grocery',  icon: '🛒', label: 'Grocery Run',         color: '#059669', desc: 'Any supermarket or local shop in Hull',         ex: 'e.g. Tesco Express, Heron Foods, Iceland' },
  { id: 'buy',      icon: '🛍️', label: 'Buy & Deliver',       color: '#7C3AED', desc: 'Send a Buddy to any shop for anything',         ex: 'e.g. Argos, Primark, local market' },
  { id: 'queue',    icon: '⏳', label: 'Queue for Me',         color: '#D97706', desc: 'Hold your spot in any queue in Hull',           ex: 'e.g. Post Office, council, NHS walk-in' },
  { id: 'parcel',   icon: '📦', label: 'Parcel & Returns',     color: '#2563EB', desc: 'Collect or drop off parcels anywhere',          ex: 'e.g. ASOS return, Amazon pickup' },
  { id: 'pharmacy', icon: '💊', label: 'Prescription Run',     color: '#DB2777', desc: 'Collect NHS or private prescriptions',          ex: 'e.g. Boots Hull, Day Lewis Pharmacy' },
];

export const MOCK_ORDERS = [
  { id: 'ORD-001', type: 'grocery',  title: 'Tesco Express — 6 items',         customer: 'Sarah M.', runner: 'Callum H.', status: 'delivered',    total: 5.50,  time: '8 min ago',  address: 'HU5 2RQ' },
  { id: 'ORD-002', type: 'pharmacy', title: 'NHS prescription — Boots Anlaby',  customer: 'James P.', runner: 'Priya S.',  status: 'in_progress',  total: 5.00,  time: 'Live',       address: 'HU3 6AB' },
  { id: 'ORD-003', type: 'parcel',   title: 'ASOS return to Post Office',        customer: 'Emma W.',  runner: 'Marcus D.', status: 'delivered',    total: 4.50,  time: '22 min ago', address: 'HU6 7LT' },
  { id: 'ORD-004', type: 'buy',      title: 'Argos click & collect pickup',      customer: 'Oliver B.',runner: 'Callum H.', status: 'in_progress',  total: 7.00,  time: 'Live',       address: 'HU1 2AA' },
  { id: 'ORD-005', type: 'queue',    title: 'Queue at Hull City Council',         customer: 'Amara K.', runner: 'Priya S.',  status: 'delivered',    total: 12.00, time: '45 min ago', address: 'HU1 3RQ' },
  { id: 'ORD-006', type: 'grocery',  title: 'Iceland — frozen goods run',        customer: 'Dan R.',   runner: 'Marcus D.', status: 'delivered',    total: 6.00,  time: '1 hr ago',   address: 'HU8 9NP' },
];

export const MOCK_RUNNERS = [
  { id: 1, name: 'Callum H.',  rating: 4.97, tasks: 842, zone: 'HU5 / HU3', eta: 4,  avatar: '🧑‍🦱', badge: 'TOP BUDDY', online: true,  earnings: '£127.50', todayTasks: 9  },
  { id: 2, name: 'Priya S.',   rating: 4.95, tasks: 614, zone: 'HU1 / HU2', eta: 7,  avatar: '👩',    badge: null,        online: true,  earnings: '£98.00',  todayTasks: 7  },
  { id: 3, name: 'Marcus D.',  rating: 4.88, tasks: 389, zone: 'HU6 / HU8', eta: 11, avatar: '🧔',    badge: null,        online: true,  earnings: '£74.50',  todayTasks: 5  },
  { id: 4, name: 'Aisha T.',   rating: 4.91, tasks: 201, zone: 'HU4 / HU5', eta: 8,  avatar: '👩‍🦱',   badge: null,        online: false, earnings: '£45.00',  todayTasks: 3  },
];

export const TRACK_STEPS = [
  { icon: '✅', label: 'Order confirmed',        sub: 'Your request has been received' },
  { icon: '🏃', label: 'Buddy on the way',       sub: 'Heading to the location now' },
  { icon: '📍', label: 'Arrived at location',    sub: 'Buddy is at the pick-up point' },
  { icon: '🛍️', label: 'Task in progress',       sub: 'Getting everything sorted for you' },
  { icon: '🎉', label: 'Delivered!',             sub: 'All done — enjoy your day!' },
];

export const HULL_ZONES = ['HU1', 'HU2', 'HU3', 'HU4', 'HU5', 'HU6', 'HU7', 'HU8', 'HU9', 'HU10'];

export const CHAT_MESSAGES = [
  { id: 1, from: 'runner', text: "Hi! I'm on my way to the shop now 👋", time: '2:31 PM' },
  { id: 2, from: 'customer', text: "Great! Please get semi-skimmed milk if they have it", time: '2:32 PM' },
  { id: 3, from: 'runner', text: "Got it! Semi-skimmed. Anything else while I'm here?", time: '2:33 PM' },
  { id: 4, from: 'customer', text: "That's everything, thank you!", time: '2:33 PM' },
  { id: 5, from: 'runner', text: "All sorted, heading to you now 🛍️", time: '2:38 PM' },
];
