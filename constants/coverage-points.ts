export const COVERAGE_POINTS = [
  // North Luzon (Pulled inward to the right)
  { name: 'Abra', x: 47.0, y: 23.5, description: 'Rugged landlocked province with agricultural valleys.' },
  { name: 'Aparri', x: 49.0, y: 20.0, description: 'Coastal town at the mouth of the Cagayan River.' },
  { name: 'Baguio', x: 46.5, y: 28.5, description: 'Cool-climate mountain city and summer capital.' },
  { name: 'Ilocos Sur', x: 45.0, y: 26.5, description: 'Historic province with heritage sites and farms.' },
  { name: 'Ilocos Norte', x: 46.5, y: 22.0, description: 'Coastal province known for wind farms and agriculture.' },
  { name: 'Cauayan', x: 50.5, y: 27.0, description: 'Fast-growing commercial city in Isabela.' },
  { name: 'Isabela', x: 51.0, y: 28.5, description: 'Major agricultural province in Cagayan Valley.' },
  { name: 'La Union', x: 45.5, y: 29.0, description: 'Coastal province known for surf and tourism.' },
  { name: 'Solano NV', x: 48.5, y: 31.5, description: 'Commercial hub of Nueva Vizcaya.' },
  { name: 'Tuguegarao', x: 49.5, y: 23.5, description: 'Main city and trade hub of Cagayan Valley.' },
  { name: 'Vigan', x: 45.0, y: 24.5, description: 'Spanish-era heritage city in Ilocos Sur.' },

  // Central Luzon (Western edge pulled inward to the right)
  { name: 'Bataan', x: 46.0, y: 40.5, description: 'Historic peninsula with ports and industry.' },
  { name: 'Bulacan', x: 48.0, y: 39.0, description: 'Highly urbanized province near Metro Manila.' },
  { name: 'Zambales', x: 45.0, y: 36.0, description: 'Coastal province with Subic Bay Freeport.' },
  { name: 'Nueva Ecija', x: 49.0, y: 35.0, description: 'Rice-producing agricultural heartland.' },
  { name: 'Olongapo', x: 45.5, y: 38.5, description: 'Port city near Subic Bay.' },
  { name: 'Pampanga', x: 47.0, y: 38.0, description: 'Economic hub known for cuisine and Clark.' },
  { name: 'Pangasinan', x: 46.0, y: 33.0, description: 'Coastal province known for islands and aquaculture.' },
  { name: 'Santiago', x: 50.0, y: 29.5, description: 'Key commercial city in Isabela.' },
  { name: 'Tarlac', x: 47.0, y: 35.5, description: 'Agricultural plains and sugar lands.' },
  { name: 'Aurora', x: 51.0, y: 34.5, description: 'Surfing and mountainous coastal province.' },

  // Metro Manila (Anchors)
  { name: 'Parañaque Hub', x: 48.0, y: 41.5, description: 'Logistics hub near major airports.' },
  { name: 'Taytay Hub', x: 49.0, y: 41.1, description: 'Commercial garment and trading center.' },
  { name: 'Las Piñas', x: 48.0, y: 42.0, description: 'Residential city with growing business zones.' },

  // South Luzon
  { name: 'Camarines Norte', x: 53.0, y: 45.5, description: 'Gateway to Bicol with mining and farms.' },
  { name: 'Camarines Sur', x: 55.0, y: 47.0, description: 'Largest Bicol province and eco-tourism hub.' },
  { name: 'Legaspi', x: 56.5, y: 48.5, description: 'Albay capital near Mayon Volcano.' },
  { name: 'Lucena', x: 50.0, y: 44.5, description: 'Commercial capital of Quezon Province.' },
  { name: 'Masbate', x: 55.5, y: 52.5, description: 'Island province known for cattle ranching.' },
  { name: 'Naga', x: 54.5, y: 46.5, description: 'Cultural and business center of Bicol.' },
  { name: 'Palawan', x: 39.0, y: 66.0, description: 'World-famous eco-tourism and nature province.' }, // Pulled significantly right
  { name: 'Quezon Province', x: 51.0, y: 45.0, description: 'Large coconut-producing province.' },
  { name: 'San Jose Occidental Mindoro', x: 47.0, y: 51.5, description: 'Main commercial hub of Occidental Mindoro.' },
  { name: 'Calapan Oriental Mindoro', x: 48.5, y: 48.0, description: 'Primary port and city of Oriental Mindoro.' },

  // Visayas (Eastern edge pulled inward to the left)
  { name: 'Bacolod', x: 54.0, y: 61.0, description: 'Sugar capital and urban center.' },
  { name: 'Cebu', x: 58.0, y: 63.5, description: 'Major business hub of the Visayas.' },
  { name: 'Dumaguete', x: 56.0, y: 66.0, description: 'University and coastal city.' },
  { name: 'Iloilo', x: 52.0, y: 60.5, description: 'Growing economic center with heritage sites.' },
  { name: 'Kalibo', x: 51.5, y: 57.0, description: 'Gateway to Boracay.' },
  { name: 'Tacloban', x: 61.5, y: 56.0, description: 'Eastern Visayas regional center.' }, // Pulled left
  { name: 'Tagbilaran', x: 58.5, y: 65.5, description: 'Main gateway to Bohol.' },
  { name: 'Roxas', x: 53.5, y: 58.0, description: 'Seafood capital of Capiz.' },

  // Mindanao (Eastern and Southern edges pulled inward)
  { name: 'Butuan', x: 62.0, y: 72.0, description: 'Caraga regional commercial hub.' }, // Pulled left
  { name: 'Cagayan de Oro', x: 60.5, y: 74.0, description: 'Northern Mindanao logistics hub.' },
  { name: 'Cotabato', x: 59.5, y: 79.5, description: 'Central Mindanao trade center.' },
  { name: 'Davao', x: 62.5, y: 79.0, description: 'Largest city in Mindanao.' }, // Pulled left
  { name: 'Dipolog', x: 55.0, y: 74.5, description: 'Sardine capital of Zamboanga del Norte.' },
  { name: 'General Santos', x: 60.5, y: 83.5, description: 'Tuna capital of the Philippines.' }, // Pulled left and slightly up
  { name: 'Ozamis', x: 57.5, y: 76.0, description: 'Key port city in Misamis Occidental.' },
  { name: 'Surigao', x: 61.5, y: 69.5, description: 'Gateway to northeastern Mindanao.' }, // Pulled left
  { name: 'Zamboanga', x: 53.0, y: 78.0, description: 'Major trade center in the peninsula.' }, // Pulled right
  { name: 'Pagadian', x: 56.0, y: 77.0, description: 'Regional center with rolling terrain.' },
].map((p, i) => ({ ...p, delay: (i % 30) * 0.03 }));