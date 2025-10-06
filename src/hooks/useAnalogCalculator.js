// src/hooks/useAnalogCalculator.js
import { useMemo } from 'react'; // useEffect и useState больше не нужны внутри хука
import {
  // Остальные импорты остаются теми же
  parseNumber, // <-- Добавлено для calcAreaMultiplier
  parsePercentToNumber,
  calcTradeMultiplier,
  calcAreaMultiplier, // <-- Импортируем функцию
  resolveLocationRegionKey,
  resolveLocationFundGroupKey,
  calcWallsMultiplier,
  resolveWallFundGroupKey,
  resolveHouseConditionRegionKey,
  resolveHouseConditionFundGroupKey,
  calcHouseConditionMultiplier,
  resolveFlatConditionRegionKey,
  calcFlatConditionMultiplier,
  resolveBalconyRegionKey,
  calcBalconyMultiplier,
  resolveFloorRegionKey,
  resolveFloorFundGroupKey,
  calcFloorMultiplier,
  TRADE_DISCOUNTS, // <-- Импортируем статически
  LOCATION_COEFFICIENTS, // <-- Импортируем статически
} from '../utils/calculations';

export const useAnalogCalculator = (
  // Добавляем 'analogs' как аргумент
  analogs, // <-- Новый аргумент
  evaluatedAreaSqm,
  selectedRegion,
  selectedFund,
  selectedEvalWall,
  selectedEvalHouseCondition,
  selectedEvalFlatCondition,
  selectedEvalBalcony,
  selectedEvalFloor,
  selectedLocationClass
) => {
  const tradeAvgPercent = useMemo(() => {
    // Используем статически импортированные TRADE_DISCOUNTS
    const regionData = TRADE_DISCOUNTS[selectedRegion];
    if (!regionData) return null;
    const fundData = regionData[selectedFund];
    if (!fundData) return null;
    return parsePercentToNumber(fundData);
  }, [selectedRegion, selectedFund]);

  const tradeMultiplier = useMemo(() => {
    if (tradeAvgPercent === null) return null;
    return calcTradeMultiplier(tradeAvgPercent);
  }, [tradeAvgPercent]);

  const locationRegionKey = resolveLocationRegionKey(selectedRegion);
  const locationFundKey = resolveLocationFundGroupKey(selectedFund);
  const locationMultiplier = useMemo(() => {
    if (!locationRegionKey || !locationFundKey || !selectedLocationClass) return null;
    const value = LOCATION_COEFFICIENTS[locationRegionKey]?.[locationFundKey]?.[selectedLocationClass];
    return Number.isFinite(value) ? Math.round(value * 10000) / 10000 : null;
  }, [locationRegionKey, locationFundKey, selectedLocationClass]);
  
  const computed = useMemo(() => {
    // Теперь используем переданный 'analogs'
    return analogs.map((a) => {
      const priceOffer = parseNumber(a.priceOfferThousand);
      const area = parseNumber(a.areaSqm);
      // Обратите внимание: расчет pricePerSqm теперь будет корректным, так как a.priceOfferThousand и a.areaSqm обновляются в App.jsx
      const pricePerSqm = area > 0 ? priceOffer / area : 0;
      const steps = [];
      let current = pricePerSqm;

      const adjustments = [
        { key: 'rights', label: 'Права (1)', value: a.adjRights },
        { key: 'finance', label: 'Финансовые условия (1)', value: a.adjFinance },
        { key: 'saleDate', label: 'Дата продажи (1)', value: a.adjSaleDate },
        { key: 'trade', label: 'Торги (1)', value: a.adjTrade || tradeMultiplier }, // Используем вычисленный multiplier, если не установлен вручную
        { key: 'location', label: 'Местоположение (1)', value: a.adjLocation || locationMultiplier }, // Используем вычисленный multiplier, если не установлен вручную
        { key: 'area', label: 'Площадь (1)', value: a.adjArea }, // <-- Теперь берётся из переданного analogs
        { key: 'walls', label: 'Материал стен (1)', value: a.adjWalls }, // <-- Теперь берётся из переданного analogs
        { key: 'communications', label: 'Коммуникации (1)', value: a.adjCommunications },
        { key: 'houseCondition', label: 'Техсостояние дома (1)', value: a.adjHouseCondition }, // <-- Теперь берётся из переданного analogs
        { key: 'floors', label: 'Этажность (1)', value: a.adjFloors }, // <-- Теперь берётся из переданного analogs
        { key: 'flatCondition', label: 'Состояние отделки (1)', value: a.adjFlatCondition }, // <-- Теперь берётся из переданного analogs
        { key: 'balcony', label: 'Балкон/лоджия (1)', value: a.adjBalcony }, // <-- Теперь берётся из переданного analogs
      ];

      for (const adj of adjustments) {
        if (Number.isFinite(adj.value)) {
          const nextValue = current * adj.value;
          steps.push({ key: adj.key, label: adj.label, value: nextValue });
          current = nextValue;
        }
      }
      const finalAdjustedPerSqm = current;

      return {
        pricePerSqm, 
        finalAdjustedPerSqm,
        steps,
      };
    });
  }, [analogs, tradeMultiplier, locationMultiplier]);

  const totalUnits = useMemo(() => {
    return analogs.reduce((sum, a) => sum + (a.units ? parseNumber(a.units) : 0), 0);
  }, [analogs]);

  const weights = useMemo(() => {
    return analogs.map(a => totalUnits > 0 ? (a.units ? parseNumber(a.units) / totalUnits : 0) : 0);
  }, [analogs, totalUnits]);

  const weightedAvgPerSqm = useMemo(() => {
    return computed.reduce((sum, c, i) => sum + c.finalAdjustedPerSqm * (weights[i] || 0), 0);
  }, [computed, weights]);
  
  const finalPriceThousand = useMemo(() => {
     return weightedAvgPerSqm * parseNumber(evaluatedAreaSqm);
  }, [weightedAvgPerSqm, evaluatedAreaSqm]);
  return {
    computed,
    totalUnits, 
    weights, 
    weightedAvgPerSqm, 
    finalPriceThousand, 
  };
};