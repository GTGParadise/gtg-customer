const defaultPlants = [
  { id: 101, name: 'Banana', sci: 'Musa acuminata', type: 'food', emoji: '🍌', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Banana-Platano.jpg/320px-Banana-Platano.jpg' },
  { id: 102, name: 'Bitter Gourd', sci: 'Momordica charantia', type: 'food', emoji: '🥒', img: '' },
  { id: 103, name: 'Tomato', sci: 'Solanum lycopersicum', type: 'food', emoji: '🍅', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Tomato_je.jpg/320px-Tomato_je.jpg' },
  { id: 104, name: 'Tulsi', sci: 'Ocimum tenuiflorum', type: 'food', emoji: '🌿', img: '' },
  { id: 105, name: 'Curry Leaf', sci: 'Murraya koenigii', type: 'food', emoji: '🍃', img: '' },
  { id: 201, name: 'Rose', sci: 'Rosa hybrida', type: 'ornamental', emoji: '🌹', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Simple_red_rose.jpg/320px-Simple_red_rose.jpg' },
  { id: 202, name: 'Hibiscus', sci: 'Hibiscus rosa-sinensis', type: 'ornamental', emoji: '🌺', img: '' },
  { id: 203, name: 'Jasmine', sci: 'Jasminum sambac', type: 'ornamental', emoji: '🤍', img: '' },
  { id: 301, name: 'Money Plant', sci: 'Epipremnum aureum', type: 'indoor', emoji: '🌿', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Epipremnum_aureum_31082012.jpg/320px-Epipremnum_aureum_31082012.jpg' },
  { id: 302, name: 'Snake Plant', sci: 'Sansevieria trifasciata', type: 'indoor', emoji: '🌱', img: '' },
  { id: 303, name: 'Aloe Vera', sci: 'Aloe barbadensis', type: 'indoor', emoji: '🌵', img: '' },
];
const defaultMaterials = [
  { id: 1, name: 'Grow Bags', emoji: '🛍️', img: '' },
  { id: 2, name: 'Cocopeat', emoji: '🟫', img: '' },
  { id: 3, name: 'Perlite', emoji: '⚪', img: '' },
  { id: 4, name: 'Drip Irrigation Kit', emoji: '💧', img: '' },
  { id: 5, name: 'Raised Bed Frame', emoji: '📦', img: '' },
  { id: 6, name: 'Organic Fertilizer', emoji: '🌾', img: '' },
  { id: 7, name: 'UV-Resistant Pots', emoji: '🪴', img: '' },
  { id: 8, name: 'Shade Net', emoji: '🕸️', img: '' },
];
const defaultPackages = [
  { id: 1, name: 'Starter Plan', duration: '3 Months', price: 2999, period: 'for 3 months', featured: false, features: ['Monthly expert visit','Basic pruning & care','Fertiliser application','Pest check','WhatsApp support'] },
  { id: 2, name: 'Growth Plan', duration: '6 Months', price: 4999, period: 'for 6 months', featured: true, features: ['Bi-monthly expert visits','Advanced pruning','Fertiliser + soil care','Pest & disease control','Seasonal plant swap','Priority WhatsApp support'] },
  { id: 3, name: 'Full Year Plan', duration: '12 Months', price: 7999, period: 'per year', featured: false, features: ['Monthly expert visits','Complete garden care','Full pest control','Free plant replacement','24/7 WhatsApp support','Annual garden redesign'] }
];
const defaultContact = { address: 'Coimbatore, Tamil Nadu', phone: '+91 80728 51669', email: 'gtgcbe.paradise@gmail.com', hours: 'Call or WhatsApp to schedule a visit', whatsapp: '+91 80728 51669', instagram: '', whatsappMessage: "Hi GTG Paradise! I'd like to know more about your garden services in Coimbatore." };
const defaultGallery = [
  { id: 1, title: 'Rooftop Organic Garden', desc: 'RS Puram, Coimbatore', mediaType: 'image', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Rooftop_garden_of_Robson_Square.jpg/640px-Rooftop_garden_of_Robson_Square.jpg', price: 0, featured: true },
  { id: 2, title: 'Balcony Herb Garden', desc: 'Saibaba Colony', mediaType: 'image', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Balcony_garden.jpg/640px-Balcony_garden.jpg', price: 0, featured: false },
  { id: 3, title: 'Vertical Garden Wall', desc: 'Peelamedu Office', mediaType: 'image', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Vertical_garden_in_Paris.jpg/640px-Vertical_garden_in_Paris.jpg', price: 99, featured: false },
  { id: 4, title: 'Full Terrace Setup', desc: 'Singanallur Villa', mediaType: 'image', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/GardenCenter.jpg/640px-GardenCenter.jpg', price: 149, featured: true },
];
export { defaultPlants, defaultMaterials, defaultPackages, defaultContact, defaultGallery }
