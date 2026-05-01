import bomiwoPouletImg from '@/assets/bomiwo-poulet.jpg';
import pouletBicycletteImg from '@/assets/poulet-bicyclette.jpg';
import aileronImg from '@/assets/aileron.jpg';
import moutonImg from '@/assets/mouton.jpg';
import croupionDindeImg from '@/assets/croupion-dinde.jpg';
import poissonsFraisGrandImg from '@/assets/poissons-frais-grand.jpg';
import poissonFraisFritesImg from '@/assets/poisson-frais-frites.jpg';
import spaghettiOmeletteImg from '@/assets/spaghetti-omelette.jpg';
import spaghettiImg from '@/assets/spaghetti.jpg';
import chawarmaImg from '@/assets/chawarma.jpg';
import gesiersImg from '@/assets/gesiers.jpg';

// Accompagnements (réutilise les images existantes)
import fritesSaladeImg from '@/assets/frites-salade.jpg';
import rizComposeImg from '@/assets/riz-compose.jpg';
import pironImg from '@/assets/piron.jpg';
import accompAkassaImg from '@/assets/accomp-akassa.jpg';
import accompAmiworImg from '@/assets/accomp-amiwor.jpg';
import couscousImg from '@/assets/couscous.jpg';
import allocoOmeletteImg from '@/assets/alloco-omelette.jpg';

// Vins
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
  // SPÉCIALITÉS — Nos délicieux mets traditionnels
  { id: 's1', name: 'Bomiwo', description: 'Pâte de maïs traditionnelle servie avec poulet braisé et sauce verte', price: 2500, image: bomiwoPouletImg, category: 'specialites', available: true },
  { id: 's2', name: 'Poulet Bicyclette', description: 'Poulet bicyclette braisé, savoureux et juteux, accompagné de sa garniture', price: 2500, image: pouletBicycletteImg, category: 'specialites', available: true },
  { id: 's3', name: 'Aileron', description: 'Ailerons de poulet braisés servis avec amiwô (pâte rouge) et sauce', price: 1500, image: aileronImg, category: 'specialites', available: true, variants: [
    { label: 'Petit format', price: 1500 },
    { label: 'Grand format', price: 2000 },
  ]},
  { id: 's4', name: 'Viande de Mouton', description: 'Brochettes de mouton grillées, tendres et épicées', price: 500, image: moutonImg, category: 'specialites', available: true },
  { id: 's5', name: 'Croupion de Dinde', description: 'Croupion de dinde braisé servi avec riz, frites et sauce tomate', price: 2000, image: croupionDindeImg, category: 'specialites', available: true },
  { id: 's6', name: 'Brochette de Gésiers', description: 'Brochettes de gésiers grillées, croustillantes à l’extérieur, fondantes à l’intérieur', price: 500, image: gesiersImg, category: 'specialites', available: true },
  { id: 's7', name: 'Poissons Frais', description: 'Poisson frais entier braisé ou frit, servi avec accompagnement au choix', price: 1500, image: poissonFraisFritesImg, category: 'specialites', available: true, variants: [
    { label: 'Format individuel', price: 1500 },
    { label: 'Format à partager', price: 3000 },
  ]},
  { id: 's8', name: 'Spaghetti', description: 'Spaghetti sautés avec garniture au choix', price: 500, image: spaghettiImg, category: 'specialites', available: true, variants: [
    { label: 'Simple (+ saucisse ou viande)', price: 500 },
    { label: 'Composé (+ saucisse & viande)', price: 700 },
    { label: 'Complet (saucisse + viande + omelette)', price: 1000 },
  ]},
  { id: 's9', name: 'Chawarma', description: 'Chawarma garni de viande, légumes frais et sauce maison', price: 1000, image: chawarmaImg, category: 'specialites', available: true, variants: [
    { label: 'Simple', price: 1000 },
    { label: 'Spécial', price: 1500 },
  ]},

  // ACCOMPAGNEMENTS (prix masqués sur le site)
  { id: 'a1', name: 'Frittes', description: 'Pommes de terre frites croustillantes et dorées', price: 0, image: fritesSaladeImg, category: 'accompagnements', available: true },
  { id: 'a2', name: 'Riz', description: 'Riz blanc parfaitement cuit', price: 0, image: rizComposeImg, category: 'accompagnements', available: true },
  { id: 'a3', name: 'Piron', description: 'Pâte de maïs traditionnelle', price: 0, image: pironImg, category: 'accompagnements', available: true },
  { id: 'a4', name: 'Akassa', description: 'Pâte de maïs fermentée, accompagnement classique béninois', price: 0, image: accompAkassaImg, category: 'accompagnements', available: true },
  { id: 'a5', name: 'Amiwo (Pâte Rouge)', description: 'Pâte de maïs rouge à la tomate', price: 0, image: accompAmiworImg, category: 'accompagnements', available: true },
  { id: 'a6', name: 'Couscous', description: 'Couscous de maïs léger et moelleux', price: 0, image: couscousImg, category: 'accompagnements', available: true },
  { id: 'a7', name: 'Aloco', description: 'Bananes plantains frites dorées et croustillantes', price: 0, image: allocoOmeletteImg, category: 'accompagnements', available: true },

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
