import fritesPouletImg from '@/assets/frites-poulet.jpg';
import fritesPoissonImg from '@/assets/frites-poisson.jpg';
import spaghettiImg from '@/assets/spaghetti.jpg';
import pironImg from '@/assets/piron.jpg';
import bomiwoImg from '@/assets/bomiwo.jpg';
import rizComposeImg from '@/assets/riz-compose.jpg';
import accompAkassaImg from '@/assets/accomp-akassa.jpg';
import accompAmiworImg from '@/assets/accomp-amiwor.jpg';
import accompPoissonImg from '@/assets/accomp-poisson-grille.jpg';
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
  // SPÉCIALITÉS
  { id: 's1', name: 'Bomiwo', description: 'Pâte de maïs traditionnelle servie avec poulet braisé, sauce verte et oignons frais', price: 2500, image: bomiwoImg, category: 'specialites', available: true },
  { id: 's2', name: 'Piron au Poisson', description: 'Piron accompagné de poisson frit, sauce tomate et piment vert', price: 1500, image: pironImg, category: 'specialites', available: true },
  { id: 's3', name: 'Piron au Poulet', description: 'Piron servi avec poulet braisé et sauce maison', price: 2000, image: pironImg, category: 'specialites', available: true },
  { id: 's4', name: 'Piron au Mouton', description: 'Piron accompagné de viande de mouton tendre et sauce épicée', price: 1000, image: pironImg, category: 'specialites', available: true },
  { id: 's5', name: 'Piron au Croupion de Dinde', description: 'Piron servi avec croupion de dinde grillé', price: 1500, image: pironImg, category: 'specialites', available: true },

  // PLATS RAPIDES
  { id: 'pr1', name: 'Frites au Poulet', description: 'Poulet braisé croustillant servi avec frites dorées et sauce tomate', price: 2000, image: fritesPouletImg, category: 'plats-rapides', available: true },
  { id: 'pr2', name: 'Frites au Poisson', description: 'Poisson entier braisé servi avec frites, salade et piment', price: 2000, image: fritesPoissonImg, category: 'plats-rapides', available: true },
  { id: 'pr3', name: 'Spaghetti Simple', description: 'Spaghetti sautés aux saucisses grillées', price: 500, image: spaghettiImg, category: 'plats-rapides', available: true },
  { id: 'pr4', name: 'Spaghetti Composé', description: 'Spaghetti aux saucisses et viande grillée', price: 700, image: spaghettiImg, category: 'plats-rapides', available: true },
  { id: 'pr5', name: 'Spaghetti Complet', description: 'Spaghetti aux saucisses, viande grillée et omelette garnie', price: 1000, image: spaghettiImg, category: 'plats-rapides', available: true },
  { id: 'pr6', name: 'Riz au Poulet', description: 'Riz blanc garni de poulet braisé, alloco et sauce tomate maison', price: 2000, image: rizComposeImg, category: 'plats-rapides', available: true },
  { id: 'pr7', name: 'Riz au Poisson', description: 'Riz blanc accompagné de poisson frit et sauce relevée', price: 1500, image: rizComposeImg, category: 'plats-rapides', available: true },

  // ACCOMPAGNEMENTS
  { id: 'a1', name: 'Frites', description: 'Pommes de terre frites croustillantes et dorées', price: 300, image: fritesPoissonImg, category: 'accompagnements', available: true },
  { id: 'a2', name: 'Riz Blanc', description: 'Riz basmati parfaitement cuit', price: 300, image: rizComposeImg, category: 'accompagnements', available: true },
  { id: 'a3', name: 'Piron', description: 'Pâte de maïs traditionnelle', price: 200, image: pironImg, category: 'accompagnements', available: true },
  { id: 'a4', name: 'Akassa', description: 'Pâte de maïs fermentée, accompagnement classique béninois', price: 200, image: accompAkassaImg, category: 'accompagnements', available: true },
  { id: 'a5', name: 'Amiwô (Pâte Rouge)', description: 'Pâte de maïs rouge à la tomate, servie avec poisson en sauce', price: 300, image: accompAmiworImg, category: 'accompagnements', available: true },
  { id: 'a6', name: 'Couscous', description: 'Couscous de maïs léger et moelleux', price: 300, image: accompAkassaImg, category: 'accompagnements', available: true },
  { id: 'a7', name: 'Alloco', description: 'Bananes plantains frites dorées et croustillantes', price: 300, image: rizComposeImg, category: 'accompagnements', available: true },

  // BOISSONS
  { id: 'b1', name: 'Jus de Bissap', description: 'Jus d\'hibiscus frais sucré naturellement', price: 500, image: bissapImg, category: 'boissons', available: true },
  { id: 'b2', name: 'Jus de Gingembre', description: 'Boisson épicée au gingembre frais et citron', price: 500, image: gingembreImg, category: 'boissons', available: true },
  { id: 'b3', name: 'Coca-Cola', description: 'Coca-Cola bien fraîche 33cl', price: 500, image: cocaImg, category: 'boissons', available: true },
  { id: 'b4', name: 'Eau Minérale', description: 'Eau minérale naturelle 1.5L', price: 500, image: eauImg, category: 'boissons', available: true },

  // VINS
  { id: 'v1', name: 'Château Margaux 2015', description: 'Grand cru classé, Bordeaux - notes de fruits noirs et épices', price: 45000, image: margauxImg, category: 'vins', available: true },
  { id: 'v2', name: 'Rosé de Provence', description: 'Rosé frais et fruité, parfait pour accompagner les grillades', price: 12000, image: roseImg, category: 'vins', available: true },
  { id: 'v3', name: 'Chardonnay', description: 'Vin blanc sec aux arômes de fruits tropicaux', price: 8000, image: chardonnayImg, category: 'vins', available: true },
  { id: 'v4', name: 'Merlot Rouge', description: 'Vin rouge souple et velouté, idéal avec viandes', price: 10000, image: merlotImg, category: 'vins', available: true },
];

export const getMenuByCategory = (category: MenuItem['category']) =>
  menuItems.filter((item) => item.category === category);
