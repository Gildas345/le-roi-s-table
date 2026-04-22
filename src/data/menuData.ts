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
import cavesRoyalesImg from '@/assets/caves-royales.jpg';
import foiDuPapeImg from '@/assets/foi-du-pape.jpg';
import domaineMajesteImg from '@/assets/domaine-majeste.jpg';
import chValacImg from '@/assets/ch-valac.jpg';
import chateauLionImg from '@/assets/chateau-lion-vaillant.jpg';
import grandVersantImg from '@/assets/grand-versant.jpg';
import chantecailleImg from '@/assets/chantecaille.jpg';
import tresorArcadesImg from '@/assets/tresor-des-arcades.jpg';

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
  category: 'specialites' | 'accompagnements' | 'vins';
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
  { id: 't1', name: 'Test Plat', description: 'Plat de test à 1 FCFA pour vérification du système de paiement', price: 1, image: bomiwoImg, category: 'specialites', available: true },

  // ACCOMPAGNEMENTS
  { id: 'a1', name: 'Frites', description: 'Pommes de terre frites croustillantes et dorées', price: 300, image: fritesSaladeImg, category: 'accompagnements', available: true },
  { id: 'a2', name: 'Riz Blanc', description: 'Riz basmati parfaitement cuit', price: 300, image: rizComposeImg, category: 'accompagnements', available: true },
  { id: 'a3', name: 'Piron', description: 'Pâte de maïs traditionnelle', price: 200, image: pironImg, category: 'accompagnements', available: true },
  { id: 'a4', name: 'Akassa', description: 'Pâte de maïs fermentée, accompagnement classique béninois', price: 200, image: accompAkassaImg, category: 'accompagnements', available: true },
  { id: 'a5', name: 'Amiwô (Pâte Rouge)', description: 'Pâte de maïs rouge à la tomate, servie avec poisson en sauce', price: 300, image: accompAmiworImg, category: 'accompagnements', available: true },
  { id: 'a6', name: 'Couscous', description: 'Couscous de maïs léger et moelleux', price: 300, image: couscousImg, category: 'accompagnements', available: true },
  { id: 'a7', name: 'Alloco', description: 'Bananes plantains frites dorées et croustillantes', price: 300, image: allocoOmeletteImg, category: 'accompagnements', available: true },

  // VINS
  { id: 'v1', name: 'Les Caves Royales', description: 'Bordeaux AOC 2020 — Vin rouge d\'exception, notes de fruits noirs et épices', price: 6000, image: cavesRoyalesImg, category: 'vins', available: true },
  { id: 'v2', name: 'La Foi du Pâpe', description: 'Bordeaux AOC — Vin rouge puissant et élégant, aux arômes complexes', price: 7000, image: foiDuPapeImg, category: 'vins', available: true },
  { id: 'v3', name: 'Domaine Majesté', description: 'Vin Rouge Moelleux — Vinification ancestrale, vin de prestige', price: 4000, image: domaineMajesteImg, category: 'vins', available: true },
  { id: 'v4', name: 'CH Valac', description: 'Cuvée Spéciale Moelleux — Vin blanc doux et fruité', price: 4000, image: chValacImg, category: 'vins', available: true },
  { id: 'v5', name: 'Château Lion Vaillant', description: 'Grande Réserve — Vin traditionnel, mis en bouteille au château', price: 7000, image: chateauLionImg, category: 'vins', available: true },
  { id: 'v6', name: 'Grand Versant', description: 'Vin blanc doux et soyeux — Une œuvre d\'art qui se déguste', price: 4000, image: grandVersantImg, category: 'vins', available: true },
  { id: 'v7', name: 'Chantecaille', description: 'Bordeaux AOP 2022 — Depuis 1840, un classique intemporel', price: 7000, image: chantecailleImg, category: 'vins', available: true },
  { id: 'v8', name: 'Trésor des Arcades', description: 'Bordeaux Supérieur AOC 2022 — Grand vin de Bordeaux, 14% vol.', price: 8000, image: tresorArcadesImg, category: 'vins', available: true },
];

export const getMenuByCategory = (category: MenuItem['category']) =>
  menuItems.filter((item) => item.category === category);
