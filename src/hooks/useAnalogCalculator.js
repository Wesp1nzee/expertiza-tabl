// hooks/useAnalogCalculator.js
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
  resolveWallsRegionKey,
  resolveWallsFundGroupKey,
  calcWallsMultiplier,
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

export const useAnalogCalculator = (evaluatedAreaSqm, selectedRegion, selectedFund, selectedEvalWall, selectedEvalHouseCondition, selectedEvalFlatCondition, selectedEvalBalcony, selectedEvalFloor, selectedLocationClass) => {
  const [analogs, setAnalogs] = useState([INITIAL_ANALOG, INITIAL_ANALOG, INITIAL_ANALOG]);

  // --- Вычисления ---
  const tradeAvgPercent = useMemo(() => {
    const regionData = TRADE_DISCOUNTS[selectedRegion];
    if (!regionData) return null;
    return parsePercentToNumber(regionData[selectedFund]);
  }, [selectedRegion, selectedFund]);

  const tradeMultiplier = useMemo(() => calcTradeMultiplier(tradeAvgPercent), [tradeAvgPercent]);

  const locationMultiplier = useMemo(() => {
    const regionKey = resolveLocationRegionKey(selectedRegion);
    if (!regionKey) return null;
    const fundKey = resolveLocationFundGroupKey(selectedFund);
    const group = LOCATION_COEFFICIENTS[regionKey]?.[fundKey];
    if (!group) return null;
    const value = group[selectedLocationClass];
    return Number.isFinite(value) ? value : null;
  }, [selectedRegion, selectedFund, selectedLocationClass]);

  // --- Автоматические корректировки ---
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
    const regionKey = resolveWallsRegionKey(selectedRegion);
    const fundKey = resolveWallsFundGroupKey(selectedFund);
    if (!regionKey || !fundKey) return;

    setAnalogs(prev => {
      let changed = false;
      const next = prev.map(a => {
        const analogWall = a.__analogWall;
        if (!analogWall) return a;
        const m = calcWallsMultiplier(regionKey, fundKey, selectedEvalWall, analogWall);
        if (m === null) return a;
        if (a.adjWalls !== m) {
          changed = true;
          return { ...a, adjWalls: m };
        }
        return a;
      });
      return changed ? next : prev;
    });
  }, [selectedRegion, selectedFund, selectedEvalWall, analogs.map(a => a.__analogWall || '').join('|')]);

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
    const regionKey = resolveBalconyRegionKey(selectedRegion);
    if (!regionKey) return;

    setAnalogs(prev => {
      let changed = false;
      const next = prev.map(a => {
        const analogBalcony = a.__analogBalcony;
        if (analogBalcony !== 'есть' && analogBalcony !== 'нет') return a;
        const m = calcBalconyMultiplier(regionKey, selectedEvalBalcony === 'есть', analogBalcony === 'есть');
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

  // --- Результаты ---
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
        { key: 'trade', label: 'Торг', value: a.adjTrade },
        { key: 'location', label: 'Местоположение', value: a.adjLocation },
        { key: 'area', label: 'Площадь квартиры', value: a.adjArea },
        { key: 'walls', label: 'Материал стен', value: a.adjWalls },
        { key: 'communications', label: 'Коммуникации', value: a.adjCommunications },
        { key: 'houseCondition', label: 'Техсостояние дома', value: a.adjHouseCondition },
        { key: 'floors', label: 'Этажность', value: a.adjFloors },
        { key: 'flatCondition', label: 'Техсостояние квартиры', value: a.adjFlatCondition },
        { key: 'balcony', label: 'Балкон/лоджия', value: a.adjBalcony },
      ];

      adjustments.forEach(adj => {
        current = current * parseNumber(adj.value || 1);
        steps.push({ ...adj, value: current });
      });

      const finalAdjustedPerSqm = current;
      const units = parseNumber(a.units);
      return { pricePerSqm, steps, finalAdjustedPerSqm, units };
    });
  }, [analogs]);

  const totalUnits = useMemo(() => computed.reduce((sum, c) => sum + c.units, 0), [computed]);
  const weights = useMemo(() => computed.map(c => totalUnits > 0 ? c.units / totalUnits : 0), [computed, totalUnits]);
  const weightedAvgPerSqm = useMemo(
    () => computed.reduce((sum, c, i) => sum + c.finalAdjustedPerSqm * (weights[i] || 0), 0),
    [computed, weights]
  );
  const finalPriceThousand = weightedAvgPerSqm * evaluatedAreaSqm;

  // --- Обработчики ---
  const updateAnalog = useCallback((idx, field, value) => {
    setAnalogs(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }, []);

  const fieldHandlers = useMemo(() => {
    const handlers = {};
    for (let i = 0; i < 3; i++) {
      handlers[i] = {
        priceOfferThousand: (value) => updateAnalog(i, 'priceOfferThousand', value),
        areaSqm: (value) => updateAnalog(i, 'areaSqm', value),
        adjRights: (value) => updateAnalog(i, 'adjRights', value),
        adjFinance: (value) => updateAnalog(i, 'adjFinance', value),
        adjSaleDate: (value) => updateAnalog(i, 'adjSaleDate', value),
        adjTrade: (value) => updateAnalog(i, 'adjTrade', value),
        adjLocation: (value) => updateAnalog(i, 'adjLocation', value),
        adjArea: (value) => updateAnalog(i, 'adjArea', value),
        adjWalls: (value) => updateAnalog(i, 'adjWalls', value),
        adjCommunications: (value) => updateAnalog(i, 'adjCommunications', value),
        adjHouseCondition: (value) => updateAnalog(i, 'adjHouseCondition', value),
        adjFloors: (value) => updateAnalog(i, 'adjFloors', value),
        adjFlatCondition: (value) => updateAnalog(i, 'adjFlatCondition', value),
        adjBalcony: (value) => updateAnalog(i, 'adjBalcony', value),
        units: (value) => updateAnalog(i, 'units', value),
        __analogWall: (value) => updateAnalog(i, '__analogWall', value),
        __analogHouseCondition: (value) => updateAnalog(i, '__analogHouseCondition', value),
        __analogFlatCondition: (value) => updateAnalog(i, '__analogFlatCondition', value),
        __analogBalcony: (value) => updateAnalog(i, '__analogBalcony', value),
        __analogFloor: (value) => updateAnalog(i, '__analogFloor', value),
      };
    }
    return handlers;
  }, [updateAnalog]);

  return {
    analogs,
    computed,
    totalUnits,
    weights,
    weightedAvgPerSqm,
    finalPriceThousand,
    fieldHandlers
  };
};