import { PrismaClient, UserType, ExcursionCategory, PlaceType, EventCategory } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed Users
  const adminPassword = await bcrypt.hash('johndoe123', 10);
  const driverPassword = await bcrypt.hash('driver123', 10);
  const touristPassword = await bcrypt.hash('tourist123', 10);

  await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: adminPassword,
      name: 'John Admin',
      userType: UserType.ADMIN,
      phone: '+238 000 0001',
    },
  });

  await prisma.user.upsert({
    where: { email: 'driver@meivolta.cv' },
    update: {},
    create: {
      email: 'driver@meivolta.cv',
      password: driverPassword,
      name: 'Carlos Driver',
      userType: UserType.DRIVER,
      phone: '+238 000 0002',
      licenseNumber: 'BV-2024-001',
      vehiclePlate: 'BV-12-34',
      vehicleModel: 'Toyota HiAce 2020',
    },
  });

  await prisma.user.upsert({
    where: { email: 'tourist@meivolta.cv' },
    update: {},
    create: {
      email: 'tourist@meivolta.cv',
      password: touristPassword,
      name: 'Maria Tourist',
      userType: UserType.TOURIST,
      phone: '+238 000 0003',
    },
  });

  // Seed Excursions
  const excursions = [
    {
      nameEn: 'Pickup 4x4 Island Tour',
      namePt: 'Tour da Ilha em Pickup 4x4',
      descriptionEn: 'Explore the entire island of Boa Vista in a rugged 4x4 pickup. Visit remote beaches, desert landscapes, and local villages on this full-day adventure.',
      descriptionPt: 'Explore toda a ilha de Boa Vista num pickup 4x4 robusto. Visite praias remotas, paisagens desérticas e aldeias locais nesta aventura de dia inteiro.',
      price: 6500,
      duration: 'Full day (8h)',
      category: ExcursionCategory.PICKUP_4X4,
      maxCapacity: 8,
      imageUrl: 'https://images.unsplash.com/photo-1533591380348-14193f1de18f?w=600',
    },
    {
      nameEn: 'Beach Hopping Tour',
      namePt: 'Tour das Praias',
      descriptionEn: 'Discover the most beautiful beaches of Boa Vista. From the vast Santa Monica to the hidden Varandinha cave beach, experience paradise.',
      descriptionPt: 'Descubra as praias mais bonitas de Boa Vista. Da vasta Santa Monica à escondida praia da Varandinha, viva o paraíso.',
      price: 4500,
      duration: '5 hours',
      category: ExcursionCategory.BEACH_TOUR,
      maxCapacity: 10,
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
    },
    {
      nameEn: 'Cultural Heritage Walk',
      namePt: 'Passeio Cultural e Patrimonial',
      descriptionEn: 'Walk through the historic streets of Sal Rei, visit the fortress, church, and local markets. Learn about Cape Verdean culture and traditions.',
      descriptionPt: 'Passeie pelas ruas históricas de Sal Rei, visite a fortaleza, a igreja e os mercados locais. Conheça a cultura e tradições cabo-verdianas.',
      price: 3000,
      duration: '3 hours',
      category: ExcursionCategory.CULTURAL,
      maxCapacity: 15,
      imageUrl: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=600',
    },
    {
      nameEn: 'Turtle Watching Experience',
      namePt: 'Observação de Tartarugas',
      descriptionEn: 'Witness the magical nesting of loggerhead sea turtles on Boa Vista beaches. A guided nocturnal experience during nesting season (June-October).',
      descriptionPt: 'Testemunhe a mágica desova das tartarugas-comuns nas praias de Boa Vista. Uma experiência noturna guiada durante a época de nidificação (Junho-Outubro).',
      price: 4000,
      duration: '3 hours',
      category: ExcursionCategory.TURTLES,
      maxCapacity: 12,
      imageUrl: 'https://images.unsplash.com/photo-1591025207163-942350e47db2?w=600',
    },
    {
      nameEn: 'Boat Trip Around the Island',
      namePt: 'Passeio de Barco à Volta da Ilha',
      descriptionEn: 'Sail around Boa Vista on a traditional fishing boat. Enjoy snorkeling stops, dolphin watching, and a fresh seafood lunch on board.',
      descriptionPt: 'Navegue à volta de Boa Vista num barco de pesca tradicional. Desfrute de paragens para mergulho, observação de golfinhos e um almoço fresco de marisco a bordo.',
      price: 5500,
      duration: '4 hours',
      category: ExcursionCategory.BOAT,
      maxCapacity: 8,
      imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600',
    },
    {
      nameEn: 'Scuba Diving Adventure',
      namePt: 'Aventura de Mergulho',
      descriptionEn: 'Dive into the crystal-clear waters of Boa Vista. Explore coral reefs, shipwrecks, and encounter tropical fish and sea turtles.',
      descriptionPt: 'Mergulhe nas águas cristalinas de Boa Vista. Explore recifes de coral, naufrágios e encontre peixes tropicais e tartarugas marinhas.',
      price: 7500,
      duration: '3 hours',
      category: ExcursionCategory.DIVING,
      maxCapacity: 6,
      imageUrl: 'https://images.pexels.com/photos/14267355/pexels-photo-14267355.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    },
    {
      nameEn: 'Sport Fishing Expedition',
      namePt: 'Expedição de Pesca Desportiva',
      descriptionEn: 'Head out to deep waters for an exciting fishing expedition. Target marlin, tuna, and wahoo with experienced local captains.',
      descriptionPt: 'Dirija-se a águas profundas para uma emocionante expedição de pesca. Pesque marlin, atum e wahoo com capitães locais experientes.',
      price: 8000,
      duration: '6 hours',
      category: ExcursionCategory.FISHING,
      maxCapacity: 6,
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600',
    },
    {
      nameEn: 'Desert of Viana Expedition',
      namePt: 'Expedição ao Deserto de Viana',
      descriptionEn: 'Journey to the stunning Desert of Viana, a unique Saharan landscape in the middle of the Atlantic. Sandboarding and sunset views included.',
      descriptionPt: 'Viaje até ao impressionante Deserto de Viana, uma paisagem saariana única no meio do Atlântico. Sandboard e vistas do pôr do sol incluídos.',
      price: 5000,
      duration: '4 hours',
      category: ExcursionCategory.DESERT_VIANA,
      maxCapacity: 10,
      imageUrl: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600',
    },
    {
      nameEn: 'Photography Tour',
      namePt: 'Tour Fotográfico',
      descriptionEn: 'Capture the best of Boa Vista with a professional photographer guide. Visit the most photogenic spots at golden hour for stunning shots.',
      descriptionPt: 'Capture o melhor de Boa Vista com um guia fotógrafo profissional. Visite os locais mais fotogénicos na hora dourada para fotos deslumbrantes.',
      price: 6000,
      duration: '5 hours',
      category: ExcursionCategory.PHOTO_TOUR,
      maxCapacity: 8,
      imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600',
    },
  ];

  for (const exc of excursions) {
    const existing = await prisma.excursion.findFirst({ where: { namePt: exc.namePt } });
    if (!existing) {
      await prisma.excursion.create({ data: exc });
    }
  }

  // Seed Places — Beaches
  const beaches = [
    {
      nameEn: 'Santa Monica Beach',
      namePt: 'Praia de Santa Monica',
      descriptionEn: 'The longest and most famous beach in Boa Vista, stretching 18km along the southern coast. Crystal-clear turquoise waters and pristine white sand.',
      descriptionPt: 'A praia mais longa e famosa de Boa Vista, estendendo-se por 18km ao longo da costa sul. Águas turquesa cristalinas e areia branca imaculada.',
      type: PlaceType.BEACH,
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
      location: 'South coast, 25min from Sal Rei',
      detailsEn: { facilities: 'Beach bar, Parking', access: 'Unpaved road, 4x4 recommended' },
      detailsPt: { facilities: 'Bar de praia, Estacionamento', access: 'Estrada não pavimentada, 4x4 recomendado' },
    },
    {
      nameEn: 'Chaves Beach',
      namePt: 'Praia de Chaves',
      descriptionEn: 'A beautiful west-coast beach with calm, warm waters perfect for swimming. Popular with families and great for watching sunsets.',
      descriptionPt: 'Uma bela praia na costa oeste com águas calmas e quentes perfeitas para nadar. Popular entre famílias e ótima para ver o pôr do sol.',
      type: PlaceType.BEACH,
      imageUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600',
      location: 'West coast, 10min from Sal Rei',
      detailsEn: { facilities: 'Hotels nearby, Restaurants, Showers', access: 'Easy, paved road' },
      detailsPt: { facilities: 'Hotéis próximos, Restaurantes, Chuveiros', access: 'Fácil, estrada pavimentada' },
    },
    {
      nameEn: 'Atalanta Beach',
      namePt: 'Praia de Atalanta',
      descriptionEn: 'Home to the famous Cabo Santa Maria shipwreck, this beach offers a unique landscape combining golden sand with maritime history.',
      descriptionPt: 'Lar do famoso naufrágio do Cabo Santa Maria, esta praia oferece uma paisagem única combinando areia dourada com história marítima.',
      type: PlaceType.BEACH,
      imageUrl: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=600',
      location: 'Northwest coast, 20min from Sal Rei',
      detailsEn: { facilities: 'Parking', access: 'Unpaved road, walkable from Chaves' },
      detailsPt: { facilities: 'Estacionamento', access: 'Estrada não pavimentada, acessível a pé desde Chaves' },
    },
    {
      nameEn: 'Estoril Beach',
      namePt: 'Praia do Estoril',
      descriptionEn: 'The town beach of Sal Rei, perfect for a quick swim. Lined with restaurants and bars, it is the most accessible beach on the island.',
      descriptionPt: 'A praia urbana de Sal Rei, perfeita para um mergulho rápido. Rodeada de restaurantes e bares, é a praia mais acessível da ilha.',
      type: PlaceType.BEACH,
      imageUrl: 'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=600',
      location: 'Sal Rei, town center',
      detailsEn: { facilities: 'Restaurants, Bars, Showers, Sunbeds', access: 'Walking distance from town center' },
      detailsPt: { facilities: 'Restaurantes, Bares, Chuveiros, Espreguiçadeiras', access: 'A pé do centro da cidade' },
    },
    {
      nameEn: 'Varandinha Beach',
      namePt: 'Praia da Varandinha',
      descriptionEn: 'A hidden gem with dramatic cliffs and natural caves. The beach is accessed through a cave opening, creating a magical atmosphere.',
      descriptionPt: 'Uma jóia escondida com falésias dramáticas e grutas naturais. A praia é acedida através de uma abertura na gruta, criando uma atmosfera mágica.',
      type: PlaceType.BEACH,
      imageUrl: 'https://lh5.googleusercontent.com/p/AF1QipOMlVvjb-LQIG26ajGlict3sJWjou7C-F7O3_Tt=s1600',
      location: 'Southwest coast, 30min from Sal Rei',
      detailsEn: { facilities: 'None — bring supplies', access: 'Unpaved road, short hike required' },
      detailsPt: { facilities: 'Nenhuma — traga mantimentos', access: 'Estrada não pavimentada, pequena caminhada necessária' },
    },
    {
      nameEn: 'Curralinho Beach',
      namePt: 'Praia de Curralinho',
      descriptionEn: 'A remote and pristine beach on the southeast coast. Perfect for those seeking solitude and untouched natural beauty.',
      descriptionPt: 'Uma praia remota e imaculada na costa sudeste. Perfeita para quem procura solidão e beleza natural intocada.',
      type: PlaceType.BEACH,
      imageUrl: 'https://images.unsplash.com/photo-1520454974749-611b7248ffdb?w=600',
      location: 'Southeast coast, 40min from Sal Rei',
      detailsEn: { facilities: 'None', access: '4x4 required, remote location' },
      detailsPt: { facilities: 'Nenhuma', access: '4x4 necessário, localização remota' },
    },
  ];

  for (const beach of beaches) {
    const existing = await prisma.place.findFirst({ where: { namePt: beach.namePt } });
    if (!existing) {
      await prisma.place.create({ data: beach });
    }
  }

  // Seed Places — Restaurants
  const restaurants = [
    {
      nameEn: 'Morabeza Restaurant',
      namePt: 'Restaurante Morabeza',
      descriptionEn: 'Authentic Cape Verdean cuisine in the heart of Sal Rei. Known for its cachupa, grilled lobster, and warm hospitality.',
      descriptionPt: 'Cozinha cabo-verdiana autêntica no coração de Sal Rei. Conhecida pela sua cachupa, lagosta grelhada e hospitalidade calorosa.',
      type: PlaceType.RESTAURANT,
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
      location: 'Sal Rei, main street',
      detailsEn: { cuisine: 'Cape Verdean', hours: '12:00-22:00', priceRange: '€€' },
      detailsPt: { cuisine: 'Cabo-verdiana', hours: '12:00-22:00', priceRange: '€€' },
    },
    {
      nameEn: 'Blue Marlin Restaurant',
      namePt: 'Restaurante Blue Marlin',
      descriptionEn: 'Fresh seafood restaurant right on the beach. Enjoy the catch of the day while watching the sunset over the Atlantic.',
      descriptionPt: 'Restaurante de marisco fresco mesmo na praia. Desfrute da pesca do dia enquanto vê o pôr do sol sobre o Atlântico.',
      type: PlaceType.RESTAURANT,
      imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600',
      location: 'Estoril Beach, Sal Rei',
      detailsEn: { cuisine: 'Seafood', hours: '11:00-23:00', priceRange: '€€€' },
      detailsPt: { cuisine: 'Marisco', hours: '11:00-23:00', priceRange: '€€€' },
    },
    {
      nameEn: 'Tortuga Beach Bar',
      namePt: 'Tortuga Beach Bar',
      descriptionEn: 'Relaxed beachside bar and grill at Santa Monica beach. International menu with local twists, perfect for a lazy beach day.',
      descriptionPt: 'Bar e grill relaxado à beira-mar na praia de Santa Monica. Menu internacional com toques locais, perfeito para um dia de praia tranquilo.',
      type: PlaceType.RESTAURANT,
      imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600',
      location: 'Santa Monica Beach',
      detailsEn: { cuisine: 'International', hours: '10:00-20:00', priceRange: '€€' },
      detailsPt: { cuisine: 'Internacional', hours: '10:00-20:00', priceRange: '€€' },
    },
    {
      nameEn: 'Casa Angela',
      namePt: 'Casa Angela',
      descriptionEn: 'Traditional home-style restaurant serving the best local dishes. A family-run gem in the center of Sal Rei.',
      descriptionPt: 'Restaurante tradicional caseiro que serve os melhores pratos locais. Uma jóia familiar no centro de Sal Rei.',
      type: PlaceType.RESTAURANT,
      imageUrl: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600',
      location: 'Sal Rei, town center',
      detailsEn: { cuisine: 'Traditional Cape Verdean', hours: '12:00-21:00', priceRange: '€' },
      detailsPt: { cuisine: 'Cabo-verdiana Tradicional', hours: '12:00-21:00', priceRange: '€' },
    },
    {
      nameEn: 'Wakan Luxury Restaurant',
      namePt: 'Restaurante Wakan Luxury',
      descriptionEn: 'Fine dining experience in a luxury resort setting. Fusion cuisine combining Cape Verdean flavors with international techniques.',
      descriptionPt: 'Experiência gastronómica de luxo num ambiente de resort. Cozinha de fusão combinando sabores cabo-verdianos com técnicas internacionais.',
      type: PlaceType.RESTAURANT,
      imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600',
      location: 'Resort area, south of Sal Rei',
      detailsEn: { cuisine: 'Fusion/Fine Dining', hours: '18:00-23:00', priceRange: '€€€€' },
      detailsPt: { cuisine: 'Fusão/Fine Dining', hours: '18:00-23:00', priceRange: '€€€€' },
    },
  ];

  for (const rest of restaurants) {
    const existing = await prisma.place.findFirst({ where: { namePt: rest.namePt } });
    if (!existing) {
      await prisma.place.create({ data: rest });
    }
  }

  // Seed Events
  const events = [
    {
      nameEn: 'Boa Vista Music Festival',
      namePt: 'Festival de Música de Boa Vista',
      descriptionEn: 'Annual music festival featuring local and international artists. Live performances, food stalls, and cultural exhibitions.',
      descriptionPt: 'Festival de música anual com artistas locais e internacionais. Espetáculos ao vivo, barracas de comida e exposições culturais.',
      category: EventCategory.MUSIC,
      date: new Date('2026-07-15T18:00:00Z'),
      endDate: new Date('2026-07-17T23:00:00Z'),
      location: 'Praia de Estoril, Sal Rei',
      imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600',
    },
    {
      nameEn: 'Santa Isabel Festival',
      namePt: 'Festa de Santa Isabel',
      descriptionEn: 'Traditional religious celebration honoring Santa Isabel, the patron saint of Boa Vista. Processions, music, and traditional food.',
      descriptionPt: 'Celebração religiosa tradicional em honra de Santa Isabel, padroeira de Boa Vista. Procissões, música e comida tradicional.',
      category: EventCategory.RELIGIOUS,
      date: new Date('2026-07-04T09:00:00Z'),
      endDate: new Date('2026-07-04T22:00:00Z'),
      location: 'Igreja de Santa Isabel, Sal Rei',
      imageUrl: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=600',
    },
    {
      nameEn: 'Beach Volleyball Tournament',
      namePt: 'Torneio de Vôlei de Praia',
      descriptionEn: 'Open beach volleyball tournament on Santa Monica Beach. Teams from all Cape Verde islands compete.',
      descriptionPt: 'Torneio aberto de vôlei de praia na Praia de Santa Monica. Equipas de todas as ilhas de Cabo Verde competem.',
      category: EventCategory.SPORTS,
      date: new Date('2026-08-10T08:00:00Z'),
      endDate: new Date('2026-08-10T18:00:00Z'),
      location: 'Praia de Santa Monica',
      imageUrl: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600',
    },
    {
      nameEn: 'Cape Verdean Culture Week',
      namePt: 'Semana Cultural Cabo-verdiana',
      descriptionEn: 'A week-long celebration of Cape Verdean culture with art exhibits, dance performances, and traditional craft workshops.',
      descriptionPt: 'Uma semana de celebração da cultura cabo-verdiana com exposições de arte, espetáculos de dança e oficinas de artesanato tradicional.',
      category: EventCategory.CULTURAL,
      date: new Date('2026-09-01T10:00:00Z'),
      endDate: new Date('2026-09-07T20:00:00Z'),
      location: 'Centro Cultural, Sal Rei',
      imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600',
    },
    {
      nameEn: 'Gamboa Festival',
      namePt: 'Festival da Gamboa',
      descriptionEn: 'The biggest music festival in Cape Verde! Three days of non-stop music, dance, and celebration on the beach.',
      descriptionPt: 'O maior festival de música de Cabo Verde! Três dias de música, dança e celebração sem parar na praia.',
      category: EventCategory.FESTIVAL,
      date: new Date('2026-08-20T16:00:00Z'),
      endDate: new Date('2026-08-22T02:00:00Z'),
      location: 'Praia de Estoril, Sal Rei',
      imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600',
    },
  ];

  for (const evt of events) {
    const existing = await prisma.event.findFirst({ where: { namePt: evt.namePt } });
    if (!existing) {
      await prisma.event.create({ data: evt });
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
