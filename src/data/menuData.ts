import pouletDgImg from '@/assets/poulet-dg.jpg';
import poissonBraiseImg from '@/assets/poisson-braise.jpg';
import brochettesImg from '@/assets/brochettes-boeuf.jpg';
import crevettesImg from '@/assets/crevettes-ail.jpg';
import rizSauteImg from '@/assets/riz-saute-poulet.jpg';
import spaghettiImg from '@/assets/spaghetti-bolognaise.jpg';
import sandwichImg from '@/assets/sandwich-royal.jpg';
import omeletteImg from '@/assets/omelette-garnie.jpg';
import allocoImg from '@/assets/alloco.jpg';
import rizBlancImg from '@/assets/riz-blanc.jpg';
import saladeImg from '@/assets/salade-composee.jpg';
import fritesImg from '@/assets/frites-maison.jpg';
import bissapImg from '@/assets/jus-bissap.jpg';
import gingembreImg from '@/assets/jus-gingembre.jpg';
import cocaImg from '@/assets/coca-cola.jpg';
import eauImg from '@/assets/eau-minerale.jpg';
import margauxImg from '@/assets/chateau-margaux.jpg';
import roseImg from '@/assets/rose-provence.jpg';
import chardonnayImg from '@/assets/chardonnay.jpg';
import merlotImg from '@/assets/merlot-rouge.jpg';

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
  { id: 's1', name: 'Poulet DG', description: 'Poulet braisé aux plantains mûrs, légumes sautés et épices africaines', price: 5500, image: pouletDgImg, category: 'specialites', available: true },
  { id: 's2', name: 'Poisson Braisé Royal', description: 'Poisson entier braisé, mariné aux herbes et piments frais', price: 6000, image: poissonBraiseImg, category: 'specialites', available: true },
  { id: 's3', name: 'Brochettes de Bœuf', description: 'Tendres morceaux de bœuf grillés avec sauce spéciale maison', price: 4500, image: brochettesImg, category: 'specialites', available: true },
  { id: 's4', name: 'Crevettes à l\'Ail', description: 'Crevettes géantes sautées à l\'ail, persil et beurre citronné', price: 7500, image: crevettesImg, category: 'specialites', available: true },

  { id: 'pr1', name: 'Riz Sauté au Poulet', description: 'Riz parfumé sauté avec poulet et légumes croquants', price: 3000, image: rizSauteImg, category: 'plats-rapides', available: true },
  { id: 'pr2', name: 'Spaghetti Bolognaise', description: 'Pâtes al dente avec sauce bolognaise maison', price: 2500, image: spaghettiImg, category: 'plats-rapides', available: true },
  { id: 'pr3', name: 'Sandwich Royal', description: 'Pain artisanal, viande grillée, crudités et sauce spéciale', price: 2000, image: sandwichImg, category: 'plats-rapides', available: true },
  { id: 'pr4', name: 'Omelette Garnie', description: 'Omelette moelleuse garnie de fromage, tomates et oignons', price: 1500, image: omeletteImg, category: 'plats-rapides', available: true },

  { id: 'a1', name: 'Alloco', description: 'Bananes plantains frites dorées et croustillantes', price: 800, image: allocoImg, category: 'accompagnements', available: true },
  { id: 'a2', name: 'Riz Blanc', description: 'Riz basmati parfaitement cuit', price: 500, image: rizBlancImg, category: 'accompagnements', available: true },
  { id: 'a3', name: 'Salade Composée', description: 'Salade fraîche de saison avec vinaigrette maison', price: 1000, image: saladeImg, category: 'accompagnements', available: true },
  { id: 'a4', name: 'Frites Maison', description: 'Pommes de terre frites croustillantes et dorées', price: 800, image: fritesImg, category: 'accompagnements', available: true },

  { id: 'b1', name: 'Jus de Bissap', description: 'Jus d\'hibiscus frais sucré naturellement', price: 500, image: bissapImg, category: 'boissons', available: true },
  { id: 'b2', name: 'Jus de Gingembre', description: 'Boisson épicée au gingembre frais et citron', price: 500, image: gingembreImg, category: 'boissons', available: true },
  { id: 'b3', name: 'Coca-Cola', description: 'Coca-Cola bien fraîche 33cl', price: 500, image: cocaImg, category: 'boissons', available: true },
  { id: 'b4', name: 'Eau Minérale', description: 'Eau minérale naturelle 1.5L', price: 500, image: eauImg, category: 'boissons', available: true },

  { id: 'v1', name: 'Château Margaux 2015', description: 'Grand cru classé, Bordeaux - notes de fruits noirs et épices', price: 45000, image: margauxImg, category: 'vins', available: true },
  { id: 'v2', name: 'Rosé de Provence', description: 'Rosé frais et fruité, parfait pour accompagner les grillades', price: 12000, image: roseImg, category: 'vins', available: true },
  { id: 'v3', name: 'Chardonnay', description: 'Vin blanc sec aux arômes de fruits tropicaux', price: 8000, image: chardonnayImg, category: 'vins', available: true },
  { id: 'v4', name: 'Merlot Rouge', description: 'Vin rouge souple et velouté, idéal avec viandes', price: 10000, image: merlotImg, category: 'vins', available: true },
];

export const getMenuByCategory = (category: MenuItem['category']) =>
  menuItems.filter((item) => item.category === category);
