export const COVERAGE_POINTS = [
  // North Luzon
  { name: 'Abra', x: 45, y: 23 },
  { name: 'Aparri', x: 53, y: 20 }, // Moved Inland
  { name: 'Baguio', x: 45, y: 30 },
  { name: 'Ilocos Sur', x: 42, y: 25 },
  { name: 'Ilocos Norte', x: 45, y: 20 }, // Moved Inland
  { name: 'Cauayan', x: 56, y: 28 },
  { name: 'Isabela', x: 57, y: 30 },
  { name: 'La Union', x: 43, y: 28 },
  { name: 'Solano NV', x: 51, y: 35 },
  { name: 'Tuguegarao', x: 55, y: 22 },
  { name: 'Vigan', x: 42, y: 23 },
  // Central Luzon
  { name: 'Bataan', x: 43, y: 44 },
  { name: 'Bulacan', x: 47, y: 43 },
  { name: 'Zambales', x: 41, y: 40 },
  { name: 'Nueva Ecija', x: 49, y: 37 },
  { name: 'Olongapo', x: 42, y: 42 },
  { name: 'Pampanga', x: 45, y: 42 },
  { name: 'Pangasinan', x: 44, y: 34 },
  { name: 'Santiago', x: 55, y: 32 },
  { name: 'Tarlac', x: 46, y: 38 },
  { name: 'Aurora', x: 55, y: 38 },
  // Metro Manila
  { name: 'Parañaque Hub', x: 46.5, y: 45.5 },
  { name: 'Taytay Hub', x: 48.5, y: 45 },
  { name: 'Las Piñas', x: 46.2, y: 46.5 },
  // South Luzon
  { name: 'Camarines Norte', x: 57, y: 47 },
  { name: 'Camarines Sur', x: 60, y: 51 },
  { name: 'Legaspi', x: 64, y: 55 },
  { name: 'Lucena', x: 51, y: 48 },
  { name: 'Masbate', x: 64, y: 62 },
  { name: 'Naga', x: 61, y: 51 },
  { name: 'Palawan', x: 33, y: 76 }, // Moved Inland
  { name: 'Quezon Province', x: 53, y: 46 },
  { name: 'San Jose Occidental Mindoro', x: 43, y: 58 },
  { name: 'Calapan Oriental Mindoro', x: 46, y: 52 },
  // Visayas
  { name: 'Bacolod', x: 55, y: 71 },
  { name: 'Cebu', x: 65, y: 72 },
  { name: 'Dumaguete', x: 59, y: 81 },
  { name: 'Iloilo', x: 53, y: 71 },
  { name: 'Kalibo', x: 52, y: 63 },
  { name: 'Tacloban', x: 72, y: 68 }, // Moved Inland
  { name: 'Tagbilaran', x: 66, y: 78 },
  { name: 'Roxas', x: 57, y: 63 },
  // Mindanao
  { name: 'Butuan', x: 73, y: 84 }, // Moved Inland
  { name: 'Cagayan de Oro', x: 68, y: 85 },
  { name: 'Cotabato', x: 65, y: 93 },
  { name: 'Davao', x: 76, y: 92 },
  { name: 'Dipolog', x: 56, y: 83 },
  { name: 'General Santos', x: 73, y: 93 },
  { name: 'Ozamis', x: 61, y: 87 },
  { name: 'Surigao', x: 74, y: 81 }, // Moved Inland
  { name: 'Zamboanga', x: 48, y: 89 }, // Moved Inland
  { name: 'Pagadian', x: 57, y: 90 },
].map((p, i) => ({ ...p, delay: (i % 30) * 0.03 }));
