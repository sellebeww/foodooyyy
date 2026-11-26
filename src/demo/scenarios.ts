// src/demo/scenarios.ts
import { DEMO_SCENARIO_1, type DemoScenario } from "./generator.ts";
import type { DemoScenarioId } from "./catalog.ts";

export const DEMO_SCENARIO_2: DemoScenario = {
  id: 2,
  seed: "foodoo-demo-2",
  stallName: "Demo Warung Makan Kantor",
  settings: {
    openAt: "10:00",
    closeAt: "15:00",
    busyProfile: { "10": 1, "11": 4, "12": 4, "13": 2, "14": 1 },
    isDemo: true,
  },
  menus: [
    {
      id: "nasi-rames",
      name: "Nasi Rames",
      price: 10000,
      cost: 6000,
      salvage: 0,
      usualQty: 45,
      archived: false,
    },
    {
      id: "soto-ayam",
      name: "Soto Ayam",
      price: 12000,
      cost: 7000,
      salvage: 0,
      usualQty: 25,
      archived: false,
    },
    {
      id: "ayam-bakar",
      name: "Ayam Bakar",
      price: 15000,
      cost: 9500,
      salvage: 0,
      usualQty: 20,
      archived: false,
    },
    {
      id: "sayur-asem",
      name: "Sayur Asem",
      price: 4000,
      cost: 1500,
      salvage: 0,
      usualQty: 30,
      archived: false,
    },
  ],
  trueMeans: {
    "nasi-rames": 52,
    "soto-ayam": 28,
    "ayam-bakar": 24,
    "sayur-asem": 22,
  },
  weekdayFactors: [0.3, 1.1, 1.0, 1.05, 1.0, 0.85, 0.45],
  historyDays: 56,
  unusualChance: 0.1,
  ownerJitter: 3,
};

export const DEMO_SCENARIO_3: DemoScenario = {
  id: 3,
  seed: "foodoo-demo-3",
  stallName: "Demo Angkringan Malam",
  settings: {
    openAt: "18:00",
    closeAt: "02:00",
    busyProfile: {
      "18": 1,
      "19": 2,
      "20": 4,
      "21": 4,
      "22": 2,
      "23": 2,
      "00": 1,
      "01": 1,
    },
    isDemo: true,
  },
  menus: [
    {
      id: "nasi-kucing",
      name: "Nasi Kucing",
      price: 3000,
      cost: 1800,
      salvage: 0,
      usualQty: 60,
      archived: false,
    },
    {
      id: "sate-usus",
      name: "Sate Usus",
      price: 2000,
      cost: 1000,
      salvage: 0,
      usualQty: 50,
      archived: false,
    },
    {
      id: "gorengan",
      name: "Gorengan",
      price: 1000,
      cost: 500,
      salvage: 0,
      usualQty: 80,
      archived: false,
    },
    {
      id: "nasi-bakar",
      name: "Nasi Bakar",
      price: 6000,
      cost: 3500,
      salvage: 0,
      usualQty: 25,
      archived: false,
    },
  ],
  trueMeans: {
    "nasi-kucing": 70,
    "sate-usus": 45,
    gorengan: 85,
    "nasi-bakar": 30,
  },
  weekdayFactors: [0.9, 0.85, 0.9, 0.95, 1.0, 1.25, 1.35],
  historyDays: 56,
  unusualChance: 0.1,
  ownerJitter: 4,
};

export const DEMO_SCENARIO_4: DemoScenario = {
  id: 4,
  seed: "foodoo-demo-4",
  stallName: "Demo Warung Baru Buka",
  settings: {
    openAt: "07:00",
    closeAt: "13:00",
    busyProfile: { "07": 4, "08": 4, "09": 2, "10": 1, "11": 2, "12": 2 },
    isDemo: true,
  },
  menus: [
    {
      id: "nasi-campur",
      name: "Nasi Campur",
      price: 9000,
      cost: 5500,
      salvage: 0,
      usualQty: 40,
      archived: false,
    },
    {
      id: "pecel",
      name: "Pecel",
      price: 7000,
      cost: 3500,
      salvage: 0,
      usualQty: 25,
      archived: false,
    },
    {
      id: "lontong-sayur",
      name: "Lontong Sayur",
      price: 8000,
      cost: 4500,
      salvage: 0,
      usualQty: 15,
      archived: false,
    },
    {
      id: "bakwan",
      name: "Bakwan",
      price: 1500,
      cost: 700,
      salvage: 500,
      usualQty: 40,
      archived: false,
    },
  ],
  trueMeans: {
    "nasi-campur": 20,
    pecel: 19,
    "lontong-sayur": 30,
    bakwan: 38,
  },
  weekdayFactors: [0.7, 1.15, 0.95, 1.0, 0.95, 1.1, 1.2],
  historyDays: 4,
  unusualChance: 0,
  ownerJitter: 2,
};

const SCENARIOS: Readonly<Record<DemoScenarioId, DemoScenario>> = {
  1: DEMO_SCENARIO_1,
  2: DEMO_SCENARIO_2,
  3: DEMO_SCENARIO_3,
  4: DEMO_SCENARIO_4,
};

export function demoScenario(id: DemoScenarioId): DemoScenario {
  return SCENARIOS[id];
}
