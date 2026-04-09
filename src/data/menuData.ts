import fritesPouletImg from '@/assets/frites-poulet.jpg';
import fritesPoissonImg from '@/assets/frites-poisson.jpg';
import spaghettiImg from '@/assets/spaghetti.jpg';
import pironImg from '@/assets/piron.jpg';
import bomiwoImg from '@/assets/bomiwo.jpg';
import rizComposeImg from '@/assets/riz-compose.jpg';
import accompAkassaImg from '@/assets/accomp-akassa.jpg';
import accompAmiworImg from '@/assets/accomp-amiwor.jpg';
import couscousImg from '@/assets/couscous.jpg';
import allocoOmeletteImg from '@/assets/alloco-omelette.jpg';
import fritesSaladeImg from '@/assets/frites-salade.jpg';
import poissonSauceImg from '@/assets/poisson-sauce.jpg';
import poissonFritAllocoImg from '@/assets/poisson-frit-alloco.jpg';
import allocoPoissonImg from '@/assets/alloco-poisson.jpg';
import amiwoImg from '@/assets/amiwo-poisson.jpg';
import bissapImg from '@/assets/jus-bissap.jpg';
import gingembreImg from '@/assets/jus-gingembre.jpg';
import cocaImg from '@/assets/coca-cola.jpg';
import eauImg from '@/assets/eau-minerale.jpg';
import margauxImg from '@/assets/chateau-margaux.jpg';
import roseImg from '@/assets/rose-provence.jpg';
import chardonnayImg from '@/assets/chardonnay.jpg';
import merlotImg from '@/assets/merlot-rouge.jpg';

export interface MenuVariant {
  label: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'specialites' | 'accompagnements' | 'boissons' | 'vins';
  available: boolean;
  variants?: MenuVariant[];
}

export const menuItems: MenuItem[] = [
  // SPÉCIALITÉS
  { id: 's1', name: 'Bomiwo', description: 'Pâte de maïs traditionnelle servie avec poulet braisé, sauce verte et oignons frais', price: 2500, image: bomiwoImg, category: 'specialites', available: true },
  { id: 's2', name: 'Piron', description: 'Piron accompagné de votre choix de viande ou poisson', price: 1500, image: pironImg, category: 'specialites', available: true, variants: [
    { label: 'Piron au Poisson', price: 1500 },
    { label: 'Piron au Poulet', price: 2000 },
    { label: 'Piron au Mouton', price: 1000 },
    { label: 'Piron au Croupion de Dinde', price: 1500 },
  ]},
  { id: 's3', name: 'Frites au Poulet', description: 'Poulet braisé croustillant servi avec frites dorées et sauce tomate', price: 2000, image: fritesPouletImg, category: 'specialites', available: true },
  { id: 's4', name: 'Frites au Poisson', description: 'Poisson entier braisé servi avec frites, salade et piment', price: 2000, image: fritesPoissonImg, category: 'specialites', available: true },
  { id: 's5', name: 'Spaghetti', description: 'Spaghetti sautés avec garniture au choix', price: 500, image: spaghettiImg, category: 'specialites', available: true, variants: [
    { label: 'Simple (+saucisses)', price: 500 },
    { label: 'Composé (+saucisse & viande)', price: 700 },
    { label: 'Complet (saucisse + viande & omelette)', price: 1000 },
  ]},
  { id: 's6', name: 'Riz', description: 'Riz blanc garni avec votre choix de viande ou poisson', price: 1500, image: rizComposeImg, category: 'specialites', available: true, variants: [
    { label: 'Riz au Poulet', price: 2000 },
    { label: 'Riz au Poisson', price: 1500 },
  ]},
  { id: 's7', name: 'Amiwô au Poisson', description: 'Pâte de maïs rouge à la tomate servie avec poisson braisé en sauce', price: 2000, image: amiwoImg, category: 'specialites', available: true },
  { id: 's8', name: 'Poisson Braisé en Sauce', description: 'Poisson entier braisé nappé de sauce tomate, oignons et piment frais', price: 2000, image: poissonSauceImg, category: 'specialites', available: true },
  { id: 's9', name: 'Poisson Frit & Alloco', description: 'Poisson frit croustillant accompagné d\'alloco doré et sauce tomate', price: 2000, image: poissonFritAllocoImg, category: 'specialites', available: true },
  { id: 's10', name: 'Alloco au Poisson', description: 'Bananes plantains frites servies avec poisson frit et sauce piquante', price: 1500, image: allocoPoissonImg, category: 'specialites', available: true },

  // ACCOMPAGNEMENTS
  { id: 'a1', name: 'Frites', description: 'Pommes de terre frites croustillantes et dorées', price: 300, image: fritesSaladeImg, category: 'accompagnements', available: true },
  { id: 'a2', name: 'Riz Blanc', description: 'Riz basmati parfaitement cuit', price: 300, image: rizComposeImg, category: 'accompagnements', available: true },
  { id: 'a3', name: 'Piron', description: 'Pâte de maïs traditionnelle', price: 200, image: pironImg, category: 'accompagnements', available: true },
  { id: 'a4', name: 'Akassa', description: 'Pâte de maïs fermentée, accompagnement classique béninois', price: 200, image: accompAkassaImg, category: 'accompagnements', available: true },
  { id: 'a5', name: 'Amiwô (Pâte Rouge)', description: 'Pâte de maïs rouge à la tomate, servie avec poisson en sauce', price: 300, image: accompAmiworImg, category: 'accompagnements', available: true },
  { id: 'a6', name: 'Couscous', description: 'Couscous de maïs léger et moelleux', price: 300, image: couscousImg, category: 'accompagnements', available: true },
  { id: 'a7', name: 'Alloco', description: 'Bananes plantains frites dorées et croustillantes', price: 300, image: allocoOmeletteImg, category: 'accompagnements', available: true },

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
