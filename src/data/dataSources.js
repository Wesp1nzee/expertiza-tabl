// src/data/dataSources.js
// Центральное хранилище справочников для масштабируемой архитектуры

// Импортируем универсальные функции
import { parseNumber, parsePercentToNumber, calcAreaMultiplier } from '../utils/calculations';

// Временно импортируем все данные из оригинального файла
// В будущем все данные будут храниться здесь
import {
  INITIAL_ANALOG,
  TRADE_DISCOUNTS,
  LOCATION_COEFFICIENTS,
  REGION_ALIASES_FOR_LOCATION,
  WALL_MATERIAL_COEFFICIENTS,
  REGION_ALIASES_FOR_WALLS,
  HOUSE_CONDITION_COEFFICIENTS,
  REGION_ALIASES_FOR_HOUSE_CONDITION,
  FLAT_CONDITION_COEFFICIENTS,
  REGION_ALIASES_FOR_FLAT_CONDITION,
  BALCONY_COEFFICIENTS,
  REGION_ALIASES_FOR_BALCONY,
  FLOOR_COEFFICIENTS,
  REGION_ALIASES_FOR_FLOORS,
} from '../utils/calculations';

// --- Справочник Лейфер 2025 ---
const HANDBOOK_2025 = {
  id: 'leifer_2025_flats',
  name: 'Лейфер 2025 Квартиры',
  description: 'Справочник Лейфера по оценке квартир на 2025 год',
  
  data: {
    INITIAL_ANALOG,
    TRADE_DISCOUNTS,
    LOCATION_COEFFICIENTS,
    REGION_ALIASES_FOR_LOCATION,
    WALL_MATERIAL_COEFFICIENTS,
    REGION_ALIASES_FOR_WALLS,
    HOUSE_CONDITION_COEFFICIENTS,
    REGION_ALIASES_FOR_HOUSE_CONDITION,
    FLAT_CONDITION_COEFFICIENTS,
    REGION_ALIASES_FOR_FLAT_CONDITION,
    BALCONY_COEFFICIENTS,
    REGION_ALIASES_FOR_BALCONY,
    FLOOR_COEFFICIENTS,
    REGION_ALIASES_FOR_FLOORS,
  },

  logic: {
    // Универсальные функции-помощники
    parseNumber,
    parsePercentToNumber,
    calcAreaMultiplier,

    // Специфичные функции для этого справочника
    calcTradeMultiplier(avgPercentNumber) {
      if (avgPercentNumber === null) return null;
      const fraction = avgPercentNumber / 100;
      const multiplier = 1 - fraction;
      return Math.round(multiplier * 10000) / 10000;
    },

    resolveLocationRegionKey(selectedRegion) {
      const { LOCATION_COEFFICIENTS, REGION_ALIASES_FOR_LOCATION } = HANDBOOK_2025.data;
      if (LOCATION_COEFFICIENTS[selectedRegion]) return selectedRegion;
      const alias = REGION_ALIASES_FOR_LOCATION[selectedRegion];
      return alias && LOCATION_COEFFICIENTS[alias] ? alias : null;
    },

    resolveLocationFundGroupKey(selectedFund) {
      if (selectedFund === 'Жилье повышенной комфортности') return 'Жилые повышенной комфортности';
      return 'Старый фонд, Массовое жилье советской постройки, Массовое современное жилье';
    },

    resolveWallsRegionKey(selectedRegion) {
      const { WALL_MATERIAL_COEFFICIENTS } = HANDBOOK_2025.data;
      if (WALL_MATERIAL_COEFFICIENTS[selectedRegion]) return selectedRegion;
      // Добавить aliases при необходимости
      return null;
    },

    resolveWallsFundGroupKey(selectedFund) {
      if (selectedFund === 'Старый фонд') return 'Старый фонд';
      return 'Массовое жилье советской постройки, Массовое современное жилье, Жилье повышенной комфортности';
    },

    getEvalWallOptions(regionKey, fundKey) {
      const { WALL_MATERIAL_COEFFICIENTS } = HANDBOOK_2025.data;
      const group = WALL_MATERIAL_COEFFICIENTS[regionKey]?.[fundKey]?.['объект_оценки'];
      return group ? Object.keys(group) : [];
    },

    getAnalogWallOptions(regionKey, fundKey, evalWall) {
      const { WALL_MATERIAL_COEFFICIENTS } = HANDBOOK_2025.data;
      const mapping = WALL_MATERIAL_COEFFICIENTS[regionKey]?.[fundKey]?.['объект_оценки']?.[evalWall];
      if (!mapping) return [];
      return Object.keys(mapping).map((k) => k.replace(/^аналог_/, ''));
    },

    calcWallsMultiplier(regionKey, fundKey, evalWall, analogWall) {
      const { WALL_MATERIAL_COEFFICIENTS } = HANDBOOK_2025.data;
      const analogKey = `аналог_${analogWall}`;
      const value = WALL_MATERIAL_COEFFICIENTS[regionKey]?.[fundKey]?.['объект_оценки']?.[evalWall]?.[analogKey];
      return Number.isFinite(value) ? Math.round(value * 10000) / 10000 : null;
    },

    resolveHouseConditionRegionKey(selectedRegion) {
      const { HOUSE_CONDITION_COEFFICIENTS, REGION_ALIASES_FOR_HOUSE_CONDITION } = HANDBOOK_2025.data;
      if (HOUSE_CONDITION_COEFFICIENTS[selectedRegion]) return selectedRegion;
      const alias = REGION_ALIASES_FOR_HOUSE_CONDITION[selectedRegion];
      return alias && HOUSE_CONDITION_COEFFICIENTS[alias] ? alias : null;
    },

    resolveHouseConditionFundGroupKey(selectedFund) {
      return 'Старый фонд, Массовое жилье советской постройки, Массовое современное жилье';
    },

    getEvalHouseConditionOptions(regionKey, fundKey) {
      const { HOUSE_CONDITION_COEFFICIENTS } = HANDBOOK_2025.data;
      const group = HOUSE_CONDITION_COEFFICIENTS[regionKey]?.[fundKey]?.['объект_оценки'];
      return group ? Object.keys(group) : [];
    },

    getAnalogHouseConditionOptions(regionKey, fundKey, evalCondition) {
      const { HOUSE_CONDITION_COEFFICIENTS } = HANDBOOK_2025.data;
      const mapping = HOUSE_CONDITION_COEFFICIENTS[regionKey]?.[fundKey]?.['объект_оценки']?.[evalCondition];
      if (!mapping) return [];
      return Object.keys(mapping).map((k) => k.replace(/^аналог_/, ''));
    },

    calcHouseConditionMultiplier(regionKey, fundKey, evalCondition, analogCondition) {
      const { HOUSE_CONDITION_COEFFICIENTS } = HANDBOOK_2025.data;
      const analogKey = `аналог_${analogCondition}`;
      const value = HOUSE_CONDITION_COEFFICIENTS[regionKey]?.[fundKey]?.['объект_оценки']?.[evalCondition]?.[analogKey];
      return Number.isFinite(value) ? Math.round(value * 10000) / 10000 : null;
    },

    resolveFlatConditionRegionKey(selectedRegion) {
      const { FLAT_CONDITION_COEFFICIENTS, REGION_ALIASES_FOR_FLAT_CONDITION } = HANDBOOK_2025.data;
      if (FLAT_CONDITION_COEFFICIENTS[selectedRegion]) return selectedRegion;
      const alias = REGION_ALIASES_FOR_FLAT_CONDITION[selectedRegion];
      return alias && FLAT_CONDITION_COEFFICIENTS[alias] ? alias : null;
    },

    getEvalFlatConditionOptions(regionKey) {
      const { FLAT_CONDITION_COEFFICIENTS } = HANDBOOK_2025.data;
      const group = FLAT_CONDITION_COEFFICIENTS[regionKey]?.['объект_оценки'];
      return group ? Object.keys(group) : [];
    },

    getAnalogFlatConditionOptions(regionKey, evalCondition) {
      const { FLAT_CONDITION_COEFFICIENTS } = HANDBOOK_2025.data;
      const mapping = FLAT_CONDITION_COEFFICIENTS[regionKey]?.['объект_оценки']?.[evalCondition];
      if (!mapping) return [];
      return Object.keys(mapping).map((k) => k.replace(/^аналог_/, ''));
    },

    calcFlatConditionMultiplier(regionKey, evalCondition, analogCondition) {
      const { FLAT_CONDITION_COEFFICIENTS } = HANDBOOK_2025.data;
      const analogKey = `аналог_${analogCondition}`;
      const value = FLAT_CONDITION_COEFFICIENTS[regionKey]?.['объект_оценки']?.[evalCondition]?.[analogKey];
      return Number.isFinite(value) ? Math.round(value * 10000) / 10000 : null;
    },

    resolveBalconyRegionKey(selectedRegion) {
      const { BALCONY_COEFFICIENTS, REGION_ALIASES_FOR_BALCONY } = HANDBOOK_2025.data;
      const key = REGION_ALIASES_FOR_BALCONY[selectedRegion];
      return key && BALCONY_COEFFICIENTS[key] ? key : null;
    },

    calcBalconyMultiplier(balconyRegionKey, evalHasBalcony, analogHasBalcony) {
      const { BALCONY_COEFFICIENTS } = HANDBOOK_2025.data;
      if (!balconyRegionKey) return null;
      const k = `${evalHasBalcony ? 'объект_есть' : 'объект_нет'}_${analogHasBalcony ? 'аналог_есть' : 'аналог_нет'}`;
      const value = BALCONY_COEFFICIENTS[balconyRegionKey]?.[k];
      return Number.isFinite(value) ? Math.round(value * 10000) / 10000 : null;
    },

    resolveFloorRegionKey(selectedRegion) {
      const { FLOOR_COEFFICIENTS, REGION_ALIASES_FOR_FLOORS } = HANDBOOK_2025.data;
      if (FLOOR_COEFFICIENTS[selectedRegion]) return selectedRegion;
      const alias = REGION_ALIASES_FOR_FLOORS[selectedRegion];
      return alias && FLOOR_COEFFICIENTS[alias] ? alias : null;
    },

    resolveFloorFundGroupKey(selectedFund) {
      if (selectedFund === 'Старый фонд' || selectedFund === 'Массовое жилье советской постройки') {
        return 'Старый фонд, Массовое жилье советской постройки';
      }
      if (selectedFund === 'Массовое современное жилье' || selectedFund === 'Жилье повышенной комфортности') {
        return 'Массовое современное жилье, Жилье повышенной комфортности';
      }
      return null;
    },

    getEvalFloorOptions(regionKey, fundKey) {
      const { FLOOR_COEFFICIENTS } = HANDBOOK_2025.data;
      const group = FLOOR_COEFFICIENTS[regionKey]?.[fundKey]?.['объект_оценки'];
      if (!group) return [];
      
      // Проверяем, есть ли маневральный/цокольный вариант
      const hasManevralnyGroup = FLOOR_COEFFICIENTS[regionKey]?.['Старый фонд, Массовое жилье советской постройки, Массовое современное жилье (маневральный/цокольный)'];
      
      const baseOptions = Object.keys(group);
      
      if (hasManevralnyGroup) {
        const manOptions = Object.keys(hasManevralnyGroup['объект_оценки'] || {});
        return [...new Set([...baseOptions, ...manOptions])];
      }
      
      return baseOptions;
    },

    getAnalogFloorOptions(regionKey, fundKey, evalFloor) {
      const { FLOOR_COEFFICIENTS } = HANDBOOK_2025.data;
      // Сначала проверяем основную группу
      let mapping = FLOOR_COEFFICIENTS[regionKey]?.[fundKey]?.['объект_оценки']?.[evalFloor];
      
      // Если не найдено, проверяем маневральный/цокольный вариант
      if (!mapping) {
        const manGroup = FLOOR_COEFFICIENTS[regionKey]?.['Старый фонд, Массовое жилье советской постройки, Массовое современное жилье (маневральный/цокольный)'];
        mapping = manGroup?.['объект_оценки']?.[evalFloor];
      }
      
      if (!mapping) return [];
      return Object.keys(mapping).map((k) => k.replace(/^аналог_/, ''));
    },

    calcFloorMultiplier(regionKey, fundKey, evalFloor, analogFloor) {
      const { FLOOR_COEFFICIENTS } = HANDBOOK_2025.data;
      const analogKey = `аналог_${analogFloor}`;
      
      // Сначала проверяем основную группу
      let value = FLOOR_COEFFICIENTS[regionKey]?.[fundKey]?.['объект_оценки']?.[evalFloor]?.[analogKey];
      
      // Если не найдено, проверяем маневральный/цокольный вариант
      if (!Number.isFinite(value)) {
        const manGroup = FLOOR_COEFFICIENTS[regionKey]?.['Старый фонд, Массовое жилье советской постройки, Массовое современное жилье (маневральный/цокольный)'];
        value = manGroup?.['объект_оценки']?.[evalFloor]?.[analogKey];
      }
      
      return Number.isFinite(value) ? Math.round(value * 10000) / 10000 : null;
    },

    formatNumber(n, digits = 2) {
      if (!Number.isFinite(n)) return '';
      return n.toFixed(digits);
    }
  }
};

// --- Справочник для демонстрации масштабируемости (пример 2024) ---
const HANDBOOK_2024 = {
  id: 'leifer_2024_flats',
  name: 'Лейфер 2024 Квартиры',
  description: 'Справочник Лейфера по оценке квартир на 2024 год (пример)',
  
  data: {
    // Наследуем все данные от 2025, но можем переопределить отдельные части
    ...HANDBOOK_2025.data,
    
    // Пример измененных торговых скидок для 2024
    TRADE_DISCOUNTS: {
      'Москва': {
        'Старый фонд': '9.2%',
        'Массовое жилье советской постройки': '8.2%',
        'Массовое современное жилье': '7.5%',
        'Жилье повышенной комфортности': '7.7%',
      },
      'Московская область': {
        'Старый фонд': '10.6%',
        'Массовое жилье советской постройки': '9.6%',
        'Массовое современное жилье': '7.1%',
        'Жилье повышенной комфортности': '-',
      },
      'Города с численностью населения более 1 млн чел. (кроме Москвы и Санкт-Петербурга)': {
        'Старый фонд': '9.3%',
        'Массовое жилье советской постройки': '8.1%',
        'Массовое современное жилье': '6.9%',
        'Жилье повышенной комфортности': '7.5%',
      },
      // Остальные регионы наследуются от 2025
      ...TRADE_DISCOUNTS,
    },
  },

  logic: {
    // Наследуем всю логику из 2025, но можем переопределить при необходимости
    ...HANDBOOK_2025.logic,
    
    // Переопределяем только если нужны специфические изменения
    calcTradeMultiplier(avgPercentNumber) {
      // Например, в 2024 могла быть другая формула
      if (avgPercentNumber === null) return null;
      const fraction = avgPercentNumber / 100;
      const multiplier = 1 - fraction;
      return Math.round(multiplier * 10000) / 10000; // Та же логика для примера
    },
  }
};

// --- Справочник Жилые дома (пример иного типа недвижимости) ---
const HANDBOOK_HOUSES_2025 = {
  id: 'leifer_2025_houses',
  name: 'Лейфер 2025 Жилые дома',
  description: 'Справочник Лейфера по оценке жилых домов на 2025 год (демо)',
  
  data: {
    // Инициальный аналог для домов отличается от квартир
    INITIAL_ANALOG: {
      priceOfferThousand: '',
      areaSqm: '',
      landAreaSqm: '', // Дополнительное поле для площади земли
      adjRights: 1,
      adjFinance: 1,
      adjSaleDate: 1,
      adjTrade: 1,
      adjLocation: 1,
      adjArea: 1,
      adjLandArea: 1, // Корректировка на площадь земли
      adjWalls: 1,
      adjCommunications: 1,
      adjHouseCondition: 1,
      adjFloors: 1,
      adjFlatCondition: 1,
      adjBalcony: 1,
      units: '',
      __analogWall: '',
      __analogHouseCondition: '',
      __analogFlatCondition: '',
      __analogBalcony: '',
      __analogFloor: '',
    },

    // Торговые скидки для домов отличаются
    TRADE_DISCOUNTS: {
      'Москва': {
        'Элитные дома': '12.5%',
        'Дома повышенной комфортности': '11.2%',
        'Дома среднего класса': '10.8%',
        'Эконом класс': '9.5%',
      },
      'Московская область': {
        'Элитные дома': '13.2%',
        'Дома повышенной комфортности': '12.1%',
        'Дома среднего класса': '11.5%',
        'Эконом класс': '10.2%',
      },
    },

    // Коэффициенты местоположения тоже другие
    LOCATION_COEFFICIENTS: {
      'Москва': {
        'Элитные дома': {
          'Престижные районы': 1.0,
          'Центральные районы': 0.85,
          'Спальные районы': 0.70,
          'Окраины': 0.55,
        },
        'Дома повышенной комфортности, Дома среднего класса, Эконом класс': {
          'Престижные районы': 1.0,
          'Центральные районы': 0.82,
          'Спальные районы': 0.68,
          'Окраины': 0.52,
        },
      },
      'Московская область': {
        'Элитные дома': {
          'Престижные поселки': 1.0,
          'Развитые населенные пункты': 0.75,
          'Обычные поселения': 0.60,
          'Отдаленные районы': 0.45,
        },
        'Дома повышенной комфортности, Дома среднего класса, Эконом класс': {
          'Престижные поселки': 1.0,
          'Развитые населенные пункты': 0.72,
          'Обычные поселения': 0.58,
          'Отдаленные районы': 0.42,
        },
      },
    },

    // Минимальные данные для других коэффициентов
    REGION_ALIASES_FOR_LOCATION: {},
    WALL_MATERIAL_COEFFICIENTS: HANDBOOK_2025.data.WALL_MATERIAL_COEFFICIENTS, // Наследуем
    REGION_ALIASES_FOR_WALLS: {},
    HOUSE_CONDITION_COEFFICIENTS: HANDBOOK_2025.data.HOUSE_CONDITION_COEFFICIENTS, // Наследуем
    REGION_ALIASES_FOR_HOUSE_CONDITION: {},
    FLAT_CONDITION_COEFFICIENTS: HANDBOOK_2025.data.FLAT_CONDITION_COEFFICIENTS, // Наследуем
    REGION_ALIASES_FOR_FLAT_CONDITION: {},
    BALCONY_COEFFICIENTS: HANDBOOK_2025.data.BALCONY_COEFFICIENTS, // Наследуем
    REGION_ALIASES_FOR_BALCONY: {},
    FLOOR_COEFFICIENTS: HANDBOOK_2025.data.FLOOR_COEFFICIENTS, // Наследуем
    REGION_ALIASES_FOR_FLOORS: {},
  },

  logic: {
    // Наследуем базовую логику
    ...HANDBOOK_2025.logic,
    
    // Переопределяем функции, которые специфичны для домов
    resolveLocationFundGroupKey(selectedFund) {
      if (selectedFund === 'Элитные дома') return 'Элитные дома';
      return 'Дома повышенной комфортности, Дома среднего класса, Эконом класс';
    },

    // Добавляем новую функцию для расчета корректировки на площадь земли
    calcLandAreaMultiplier(evaluatedLandArea, analogLandArea) {
      const L_OO = Number(evaluatedLandArea);
      const L_OA = Number(analogLandArea);
      if (!Number.isFinite(L_OO) || !Number.isFinite(L_OA) || L_OO <= 0 || L_OA <= 0) return null;
      // Для земли используем другую формулу
      const raw = Math.pow(L_OO / L_OA, -0.04);
      return Math.round(raw * 10000) / 10000;
    },

    // Переопределяем торговую скидку с немного другой логикой
    calcTradeMultiplier(avgPercentNumber) {
      if (avgPercentNumber === null) return null;
      const fraction = avgPercentNumber / 100;
      // Для домов применяем немного другую формулу
      const multiplier = 1 - (fraction * 0.95); // Чуть меньший эффект торга
      return Math.round(multiplier * 10000) / 10000;
    },
  }
};

// --- Центральное хранилище всех справочников ---
export const DATA_SOURCES = {
  [HANDBOOK_2025.id]: HANDBOOK_2025,
  [HANDBOOK_2024.id]: HANDBOOK_2024,
  [HANDBOOK_HOUSES_2025.id]: HANDBOOK_HOUSES_2025,
};

// Экспортируем функцию для получения справочника по умолчанию
export function getDefaultHandbookId() {
  return HANDBOOK_2025.id;
}

// Экспортируем функцию для получения списка доступных справочников
export function getAvailableHandbooks() {
  return Object.values(DATA_SOURCES).map(handbook => ({
    id: handbook.id,
    name: handbook.name,
    description: handbook.description
  }));
}

export default DATA_SOURCES;
