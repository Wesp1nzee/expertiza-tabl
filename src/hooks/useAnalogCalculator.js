// hooks/useAnalogCalculator.js
import { useState, useMemo, useCallback, useEffect } from 'react';

export const useAnalogCalculator = (evaluatedAreaSqm, selectedRegion, selectedFund, selectedEvalWall, selectedEvalHouseCondition, selectedEvalFlatCondition, selectedEvalBalcony, selectedEvalFloor, selectedLocationClass, handbook) => {
  const [analogs, setAnalogs] = useState(() => {
    const initialAnalog = handbook?.data.INITIAL_ANALOG || {};
    return [initialAnalog, initialAnalog, initialAnalog];
  });

  // --- Вычисления ---
  const tradeAvgPercent = useMemo(() => {
    if (!handbook) return null;
    const regionData = handbook.data.TRADE_DISCOUNTS[selectedRegion];
    if (!regionData) return null;
    return handbook.logic.parsePercentToNumber(regionData[selectedFund]);
  }, [selectedRegion, selectedFund, handbook]);

  const tradeMultiplier = useMemo(() => {
    if (!handbook) return null;
    return handbook.logic.calcTradeMultiplier(tradeAvgPercent);
  }, [tradeAvgPercent, handbook]);

  const locationMultiplier = useMemo(() => {
    if (!handbook) return null;
    const regionKey = handbook.logic.resolveLocationRegionKey(selectedRegion);
    if (!regionKey) return null;
    const fundKey = handbook.logic.resolveLocationFundGroupKey(selectedFund);
    const group = handbook.data.LOCATION_COEFFICIENTS[regionKey]?.[fundKey];
    if (!group) return null;
    const value = group[selectedLocationClass];
    return Number.isFinite(value) ? value : null;
  }, [selectedRegion, selectedFund, selectedLocationClass, handbook]);

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
    if (!handbook) return;
    const regionKey = handbook.logic.resolveWallsRegionKey(selectedRegion);
    const fundKey = handbook.logic.resolveWallsFundGroupKey(selectedFund);
    if (!regionKey || !fundKey) return;

    setAnalogs(prev => {
      let changed = false;
      const next = prev.map(a => {
        const analogWall = a.__analogWall;
        if (!analogWall) return a;
        const m = handbook.logic.calcWallsMultiplier(regionKey, fundKey, selectedEvalWall, analogWall);
        if (m === null) return a;
        if (a.adjWalls !== m) {
          changed = true;
          return { ...a, adjWalls: m };
        }
        return a;
      });
      return changed ? next : prev;
    });
  }, [selectedRegion, selectedFund, selectedEvalWall, analogs.map(a => a.__analogWall || '').join('|'), handbook]);

  useEffect(() => {
    if (!handbook) return;
    const regionKey = handbook.logic.resolveHouseConditionRegionKey(selectedRegion);
    const fundKey = handbook.logic.resolveHouseConditionFundGroupKey(selectedFund);
    if (!regionKey || !fundKey) return;

    setAnalogs(prev => {
      let changed = false;
      const next = prev.map(a => {
        const analogCondition = a.__analogHouseCondition;
        if (!analogCondition) return a;
        const m = handbook.logic.calcHouseConditionMultiplier(regionKey, fundKey, selectedEvalHouseCondition, analogCondition);
        if (m === null) return a;
        if (a.adjHouseCondition !== m) {
          changed = true;
          return { ...a, adjHouseCondition: m };
        }
        return a;
      });
      return changed ? next : prev;
    });
  }, [selectedRegion, selectedFund, selectedEvalHouseCondition, analogs.map(a => a.__analogHouseCondition || '').join('|'), handbook]);

  useEffect(() => {
    if (!handbook) return;
    const regionKey = handbook.logic.resolveFlatConditionRegionKey(selectedRegion);
    if (!regionKey) return;

    setAnalogs(prev => {
      let changed = false;
      const next = prev.map(a => {
        const analogCondition = a.__analogFlatCondition;
        if (!analogCondition) return a;
        const m = handbook.logic.calcFlatConditionMultiplier(regionKey, selectedEvalFlatCondition, analogCondition);
        if (m === null) return a;
        if (a.adjFlatCondition !== m) {
          changed = true;
          return { ...a, adjFlatCondition: m };
        }
        return a;
      });
      return changed ? next : prev;
    });
  }, [selectedRegion, selectedEvalFlatCondition, analogs.map(a => a.__analogFlatCondition || '').join('|'), handbook]);

  useEffect(() => {
    if (!handbook) return;
    const regionKey = handbook.logic.resolveBalconyRegionKey(selectedRegion);
    if (!regionKey) return;

    setAnalogs(prev => {
      let changed = false;
      const next = prev.map(a => {
        const analogBalcony = a.__analogBalcony;
        if (analogBalcony !== 'есть' && analogBalcony !== 'нет') return a;
        const m = handbook.logic.calcBalconyMultiplier(regionKey, selectedEvalBalcony === 'есть', analogBalcony === 'есть');
        if (m === null) return a;
        if (a.adjBalcony !== m) {
          changed = true;
          return { ...a, adjBalcony: m };
        }
        return a;
      });
      return changed ? next : prev;
    });
  }, [selectedRegion, selectedEvalBalcony, analogs.map(a => a.__analogBalcony || '').join('|'), handbook]);

  useEffect(() => {
    if (!handbook) return;
    const regionKey = handbook.logic.resolveFloorRegionKey(selectedRegion);
    const fundKey = handbook.logic.resolveFloorFundGroupKey(selectedFund);
    if (!regionKey || !fundKey) return;

    setAnalogs(prev => {
      let changed = false;
      const next = prev.map(a => {
        const analogFloor = a.__analogFloor;
        if (!analogFloor) return a;
        const m = handbook.logic.calcFloorMultiplier(regionKey, fundKey, selectedEvalFloor, analogFloor);
        if (m === null) return a;
        if (a.adjFloors !== m) {
          changed = true;
          return { ...a, adjFloors: m };
        }
        return a;
      });
      return changed ? next : prev;
    });
  }, [selectedRegion, selectedFund, selectedEvalFloor, analogs.map(a => a.__analogFloor || '').join('|'), handbook]);

  useEffect(() => {
    if (!handbook) return;
    setAnalogs(prev => {
      let changed = false;
      const next = prev.map(a => {
        const m = handbook.logic.calcAreaMultiplier(evaluatedAreaSqm, handbook.logic.parseNumber(a.areaSqm));
        if (m === null) return a;
        if (a.adjArea !== m) {
          changed = true;
          return { ...a, adjArea: m };
        }
        return a;
      });
      return changed ? next : prev;
    });
  }, [evaluatedAreaSqm, analogs.map(a => a.areaSqm).join(','), handbook]);

  // --- Результаты ---
  const computed = useMemo(() => {
    if (!handbook) return [];
    return analogs.map((a) => {
      const priceOffer = handbook.logic.parseNumber(a.priceOfferThousand);
      const area = handbook.logic.parseNumber(a.areaSqm);
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
        current = current * handbook.logic.parseNumber(adj.value || 1);
        steps.push({ ...adj, value: current });
      });

      const finalAdjustedPerSqm = current;
      const units = handbook.logic.parseNumber(a.units);
      return { pricePerSqm, steps, finalAdjustedPerSqm, units };
    });
  }, [analogs, handbook]);

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