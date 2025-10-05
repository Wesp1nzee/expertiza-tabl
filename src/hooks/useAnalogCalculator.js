// src/hooks/useAnalogCalculator.js
import { useState, useMemo, useCallback, useEffect } from 'react';

import {
  INITIAL_ANALOG,
  TRADE_DISCOUNTS,
  LOCATION_COEFFICIENTS,
  parseNumber,
  parsePercentToNumber,
  calcTradeMultiplier,
  calcAreaMultiplier,
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
} from '../utils/calculations';

export const useAnalogCalculator = (
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
  const [analogs, setAnalogs] = useState([
    { ...INITIAL_ANALOG },
    { ...INITIAL_ANALOG },
    { ...INITIAL_ANALOG },
  ]);

  // - Вычисления -
  const tradeAvgPercent = useMemo(() => {
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

  // - Автоматические корректировки -
  useEffect(() => {
    if (tradeMultiplier !== null) {
      setAnalogs(prev => prev.map(a => ({ ...a, adjTrade: tradeMultiplier })));
    }
  }, [tradeMultiplier]);

  useEffect(() => {
    if (locationMultiplier !== null) {
      setAnalogs(prev => prev.map(a => ({ ...a, adjLocation: locationMultiplier })));
    }
  }, [locationMultiplier]);

  useEffect(() => {
    const fundKey = resolveWallFundGroupKey(selectedFund);
    if (!fundKey) return;

    setAnalogs(prev => {
      let changed = false;
      const next = prev.map(a => {
        const analogWall = a.__analogWall;
        if (!analogWall) return a;
        const m = calcWallsMultiplier(fundKey, selectedEvalWall, analogWall);
        if (m === null) return a;
        if (a.adjWalls !== m) {
          changed = true;
          return { ...a, adjWalls: m };
        }
        return a;
      });
      return changed ? next : prev;
    });
  }, [selectedFund, selectedEvalWall, analogs.map(a => a.__analogWall || '').join('|')]);

  useEffect(() => {
    const regionKey = resolveHouseConditionRegionKey(selectedRegion);
    const fundKey = resolveHouseConditionFundGroupKey(selectedFund);
    if (!regionKey || !fundKey) return;

    setAnalogs(prev => {
      let changed = false;
      const next = prev.map(a => {
        const analogCondition = a.__analogHouseCondition;
        if (!analogCondition) return a;
        const m = calcHouseConditionMultiplier(regionKey, fundKey, selectedEvalHouseCondition, analogCondition);
        if (m === null) return a;
        if (a.adjHouseCondition !== m) {
          changed = true;
          return { ...a, adjHouseCondition: m };
        }
        return a;
      });
      return changed ? next : prev;
    });
  }, [selectedRegion, selectedFund, selectedEvalHouseCondition, analogs.map(a => a.__analogHouseCondition || '').join('|')]);

  useEffect(() => {
    const regionKey = resolveFlatConditionRegionKey(selectedRegion);
    if (!regionKey) return;

    setAnalogs(prev => {
      let changed = false;
      const next = prev.map(a => {
        const analogCondition = a.__analogFlatCondition;
        if (!analogCondition) return a;
        const m = calcFlatConditionMultiplier(regionKey, selectedEvalFlatCondition, analogCondition);
        if (m === null) return a;
        if (a.adjFlatCondition !== m) {
          changed = true;
          return { ...a, adjFlatCondition: m };
        }
        return a;
      });
      return changed ? next : prev;
    });
  }, [selectedRegion, selectedEvalFlatCondition, analogs.map(a => a.__analogFlatCondition || '').join('|')]);

  useEffect(() => {
    const balconyRegionKey = resolveBalconyRegionKey(selectedRegion);
    if (!balconyRegionKey) return;

    setAnalogs(prev => {
      let changed = false;
      const next = prev.map(a => {
        const analogBalcony = a.__analogBalcony;
        if (analogBalcony !== 'есть' && analogBalcony !== 'нет') return a;
        const m = calcBalconyMultiplier(balconyRegionKey, selectedEvalBalcony === 'есть', analogBalcony === 'есть');
        if (m === null) return a;
        if (a.adjBalcony !== m) {
          changed = true;
          return { ...a, adjBalcony: m };
        }
        return a;
      });
      return changed ? next : prev;
    });
  }, [selectedRegion, selectedEvalBalcony, analogs.map(a => a.__analogBalcony || '').join('|')]);

  useEffect(() => {
    const regionKey = resolveFloorRegionKey(selectedRegion);
    const fundKey = resolveFloorFundGroupKey(selectedFund);
    if (!regionKey || !fundKey) return;

    setAnalogs(prev => {
      let changed = false;
      const next = prev.map(a => {
        const analogFloor = a.__analogFloor;
        if (!analogFloor) return a;
        const m = calcFloorMultiplier(regionKey, fundKey, selectedEvalFloor, analogFloor);
        if (m === null) return a;
        if (a.adjFloors !== m) {
          changed = true;
          return { ...a, adjFloors: m };
        }
        return a;
      });
      return changed ? next : prev;
    });
  }, [selectedRegion, selectedFund, selectedEvalFloor, analogs.map(a => a.__analogFloor || '').join('|')]);

  useEffect(() => {
    setAnalogs(prev => {
      let changed = false;
      const next = prev.map(a => {
        const m = calcAreaMultiplier(evaluatedAreaSqm, parseNumber(a.areaSqm));
        if (m === null) return a;
        if (a.adjArea !== m) {
          changed = true;
          return { ...a, adjArea: m };
        }
        return a;
      });
      return changed ? next : prev;
    });
  }, [evaluatedAreaSqm, analogs.map(a => a.areaSqm).join(',')]);

  // - Результаты -
  const computed = useMemo(() => {
    return analogs.map((a) => {
      const priceOffer = parseNumber(a.priceOfferThousand);
      const area = parseNumber(a.areaSqm);
      const pricePerSqm = area > 0 ? priceOffer / area : 0;
      const steps = [];
      let current = pricePerSqm;

      // Применяем все корректировки
      const adjustments = [
        { key: 'rights', label: 'Права (1)', value: a.adjRights },
        { key: 'finance', label: 'Финансовые условия (1)', value: a.adjFinance },
        { key: 'saleDate', label: 'Дата продажи (1)', value: a.adjSaleDate },
        { key: 'trade', label: 'Торги (1)', value: a.adjTrade },
        { key: 'location', label: 'Местоположение (1)', value: a.adjLocation },
        { key: 'area', label: 'Площадь (1)', value: a.adjArea },
        { key: 'walls', label: 'Материал стен (1)', value: a.adjWalls },
        { key: 'communications', label: 'Коммуникации (1)', value: a.adjCommunications },
        { key: 'houseCondition', label: 'Техсостояние дома (1)', value: a.adjHouseCondition },
        { key: 'floors', label: 'Этажность (1)', value: a.adjFloors },
        { key: 'flatCondition', label: 'Состояние отделки (1)', value: a.adjFlatCondition },
        { key: 'balcony', label: 'Балкон/лоджия (1)', value: a.adjBalcony },
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
  }, [analogs]);

  const totalUnits = useMemo(() => {
    return analogs.reduce((sum, a) => sum + (a.units ? parseNumber(a.units) : 0), 0);
  }, [analogs]);

  const weights = useMemo(() => {
    return analogs.map(a => totalUnits > 0 ? (a.units ? parseNumber(a.units) / totalUnits : 0) : 0);
  }, [analogs, totalUnits]);

  const weightedAvgPerSqm = useMemo(() => {
    return computed.reduce((sum, c, i) => sum + c.finalAdjustedPerSqm * (weights[i] || 0), 0);
  }, [computed, weights]);

  const finalPriceThousand = weightedAvgPerSqm * parseNumber(evaluatedAreaSqm);

  // - Возвращаемые данные -
  return {
    analogs,
    computed,
    totalUnits,
    weights,
    weightedAvgPerSqm,
    finalPriceThousand,
    fieldHandlers: {}, // Обработчики управляются в App.jsx
  };
};