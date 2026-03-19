export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'specialites' | 'plats-rapides' | 'accompagnements' | 'boissons' | 'vins';
  available: boolean;
}

export const menuItems: MenuItem[] = [
  // Spécialités
  { id: 's1', name: 'Poulet DG', description: 'Poulet braisé aux plantains mûrs, légumes sautés et épices africaines', price: 5500, image: '', category: 'specialites', available: true },
  { id: 's2', name: 'Poisson Braisé Royal', description: 'Poisson entier braisé, mariné aux herbes et piments frais', price: 6000, image: '', category: 'specialites', available: true },
  { id: 's3', name: 'Brochettes de Bœuf', description: 'Tendres morceaux de bœuf grillés avec sauce spéciale maison', price: 4500, image: '', category: 'specialites', available: true },
  { id: 's4', name: 'Crevettes à l\'Ail', description: 'Crevettes géantes sautées à l\'ail, persil et beurre citronné', price: 7500, image: '', category: 'specialites', available: true },

  // Plats rapides
  { id: 'pr1', name: 'Riz Sauté au Poulet', description: 'Riz parfumé sauté avec poulet et légumes croquants', price: 3000, image: '', category: 'plats-rapides', available: true },
  { id: 'pr2', name: 'Spaghetti Bolognaise', description: 'Pâtes al dente avec sauce bolognaise maison', price: 2500, image: '', category: 'plats-rapides', available: true },
  { id: 'pr3', name: 'Sandwich Royal', description: 'Pain artisanal, viande grillée, crudités et sauce spéciale', price: 2000, image: '', category: 'plats-rapides', available: true },
  { id: 'pr4', name: 'Omelette Garnie', description: 'Omelette moelleuse garnie de fromage, tomates et oignons', price: 1500, image: '', category: 'plats-rapides', available: true },

  // Accompagnements
  { id: 'a1', name: 'Alloco', description: 'Bananes plantains frites dorées et croustillantes', price: 800, image: '', category: 'accompagnements', available: true },
  { id: 'a2', name: 'Riz Blanc', description: 'Riz basmati parfaitement cuit', price: 500, image: '', category: 'accompagnements', available: true },
  { id: 'a3', name: 'Salade Composée', description: 'Salade fraîche de saison avec vinaigrette maison', price: 1000, image: '', category: 'accompagnements', available: true },
  { id: 'a4', name: 'Frites Maison', description: 'Pommes de terre frites croustillantes et dorées', price: 800, image: '', category: 'accompagnements', available: true },

  // Boissons
  { id: 'b1', name: 'Jus de Bissap', description: 'Jus d\'hibiscus frais sucré naturellement', price: 500, image: '', category: 'boissons', available: true },
  { id: 'b2', name: 'Jus de Gingembre', description: 'Boisson épicée au gingembre frais et citron', price: 500, image: '', category: 'boissons', available: true },
  { id: 'b3', name: 'Coca-Cola', description: 'Coca-Cola bien fraîche 33cl', price: 500, image: '', category: 'boissons', available: true },
  { id: 'b4', name: 'Eau Minérale', description: 'Eau minérale naturelle 1.5L', price: 500, image: '', category: 'boissons', available: true },

  // Vins
  { id: 'v1', name: 'Château Margaux 2015', description: 'Grand cru classé, Bordeaux - notes de fruits noirs et épices', price: 45000, image: '', category: 'vins', available: true },
  { id: 'v2', name: 'Rosé de Provence', description: 'Rosé frais et fruité, parfait pour accompagner les grillades', price: 12000, image: '', category: 'vins', available: true },
  { id: 'v3', name: 'Chardonnay', description: 'Vin blanc sec aux arômes de fruits tropicaux', price: 8000, image: '', category: 'vins', available: true },
  { id: 'v4', name: 'Merlot Rouge', description: 'Vin rouge souple et velouté, idéal avec viandes', price: 10000, image: '', category: 'vins', available: true },
];

export const getMenuByCategory = (category: MenuItem['category']) =>
  menuItems.filter((item) => item.category === category);
