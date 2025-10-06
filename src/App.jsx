// src/App.jsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useResponsive } from './hooks/useResponsive';
import { useAnalogCalculator } from './hooks/useAnalogCalculator';
import AnalogInput from './components/AnalogInput';
import AnalogSelect from './components/AnalogSelect';
import AnalogRow from './components/AnalogRow';
import ResultRow from './components/ResultRow';
import { INITIAL_ANALOG } from './utils/calculations';

import {
  containerStyle,
  headerStyle,
  mobileContainerStyle,
  mobileHeaderStyle,
  tableContainerStyle,
  tableStyle,
  theadStyle,
  thStyle,
  analogHeaderStyle,
  mobileTableStyle,
  mobileThStyle,
  inputStyle,
  selectStyle,
  sectionDividerStyle,
  noteStyle,
  tdStyle,
  mobileTdStyle,
  mobileInputStyle,
  inputFocusStyle,
  inputErrorStyle,
  highlightRowStyle,
  resultRowStyle,
  finalRowStyle,
  valueDisplayStyle,
  mobileValueDisplayStyle,
  inputGroupStyle,
} from './styles';

import {
  TRADE_DISCOUNTS,
  LOCATION_COEFFICIENTS,
  resolveLocationRegionKey,
  resolveLocationFundGroupKey,
  getEvalWallOptions,
  getAnalogWallOptions,
  calcWallsMultiplier,
  resolveWallFundGroupKey,
  resolveHouseConditionRegionKey,
  resolveHouseConditionFundGroupKey,
  getEvalHouseConditionOptions,
  getAnalogHouseConditionOptions,
  resolveFlatConditionRegionKey,
  getEvalFlatConditionOptions,
  getAnalogFlatConditionOptions,
  resolveBalconyRegionKey,
  calcFlatConditionMultiplier,
  calcBalconyMultiplier,
  resolveFloorRegionKey,
  resolveFloorFundGroupKey,
  getEvalFloorOptions,
  getAnalogFloorOptions,
  formatNumber,
  calcHouseConditionMultiplier,
  calcFloorMultiplier,
  parseNumber,
  calcAreaMultiplier
} from './utils/calculations';

const App = () => {
  const { isMobile } = useResponsive();

  // - Состояние настроек -
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedFund, setSelectedFund] = useState('');
  const [selectedLocationClass, setSelectedLocationClass] = useState('');
  const [selectedEvalWall, setSelectedEvalWall] = useState('');
  const [selectedEvalHouseCondition, setSelectedEvalHouseCondition] = useState('');
  const [selectedEvalFlatCondition, setSelectedEvalFlatCondition] = useState('');
  const [selectedEvalBalcony, setSelectedEvalBalcony] = useState('');
  const [selectedEvalFloor, setSelectedEvalFloor] = useState('');
  const [evaluatedAreaSqm, setEvaluatedAreaSqm] = useState('');

  // - Состояние аналогов -
  const [analogs, setAnalogs] = useState([
    { ...INITIAL_ANALOG },
    { ...INITIAL_ANALOG },
    { ...INITIAL_ANALOG },
  ]);

  // - Вспомогательные вычисления для UI -
  const locationRegionKey = resolveLocationRegionKey(selectedRegion);
  const locationFundKey = resolveLocationFundGroupKey(selectedFund);
  const locationMultiplier = useMemo(() => {
    if (!locationRegionKey || !locationFundKey || !selectedLocationClass) return null;
    const value = LOCATION_COEFFICIENTS[locationRegionKey]?.[locationFundKey]?.[selectedLocationClass];
    return Number.isFinite(value) ? Math.round(value * 10000) / 10000 : null;
  }, [locationRegionKey, locationFundKey, selectedLocationClass]);

  const locationOptions = useMemo(() => {
    if (!locationRegionKey || !locationFundKey) return [];
    const group = LOCATION_COEFFICIENTS[locationRegionKey]?.[locationFundKey];
    return group ? Object.keys(group) : [];
  }, [locationRegionKey, locationFundKey]);

  const wallFundKey = useMemo(() => resolveWallFundGroupKey(selectedFund), [selectedFund]);
  const evalWallOptions = useMemo(() => {
    return wallFundKey ? getEvalWallOptions(wallFundKey) : [];
  }, [wallFundKey]);

  const analogWallOptions = useMemo(() => {
    return wallFundKey ? getAnalogWallOptions(wallFundKey, selectedEvalWall) : [];
  }, [wallFundKey, selectedEvalWall]);

  const houseConditionRegionKey = resolveHouseConditionRegionKey(selectedRegion);
  const houseConditionFundKey = resolveHouseConditionFundGroupKey(selectedFund);
  const evalHouseConditionOptions = useMemo(() => {
    return houseConditionRegionKey && houseConditionFundKey
      ? getEvalHouseConditionOptions(houseConditionRegionKey, houseConditionFundKey)
      : [];
  }, [houseConditionRegionKey, houseConditionFundKey]);

  const analogHouseConditionOptions = useMemo(() => {
    return houseConditionRegionKey && houseConditionFundKey
      ? getAnalogHouseConditionOptions(houseConditionRegionKey, houseConditionFundKey, selectedEvalHouseCondition)
      : [];
  }, [houseConditionRegionKey, houseConditionFundKey, selectedEvalHouseCondition]);

  const flatConditionRegionKey = resolveFlatConditionRegionKey(selectedRegion);
  const evalFlatConditionOptions = useMemo(() => {
    return flatConditionRegionKey ? getEvalFlatConditionOptions(flatConditionRegionKey) : [];
  }, [flatConditionRegionKey]);

  const analogFlatConditionOptions = useMemo(() => {
    return flatConditionRegionKey ? getAnalogFlatConditionOptions(flatConditionRegionKey, selectedEvalFlatCondition) : [];
  }, [flatConditionRegionKey, selectedEvalFlatCondition]);

  const balconyRegionKey = resolveBalconyRegionKey(selectedRegion);

  const floorRegionKey = resolveFloorRegionKey(selectedRegion);
  const floorFundKey = resolveFloorFundGroupKey(selectedFund);
  const evalFloorOptions = useMemo(() => {
    return floorRegionKey && floorFundKey
      ? getEvalFloorOptions(floorRegionKey, floorFundKey)
      : [];
  }, [floorRegionKey, floorFundKey]);

  const analogFloorOptions = useMemo(() => {
    return floorRegionKey && floorFundKey
      ? getAnalogFloorOptions(floorRegionKey, floorFundKey, selectedEvalFloor)
      : [];
  }, [floorRegionKey, floorFundKey, selectedEvalFloor]);

  // - Сброс зависимых полей при изменении фонда -
  useEffect(() => {
    setSelectedLocationClass('');
    setSelectedEvalWall('');
    setSelectedEvalHouseCondition('');
    setSelectedEvalFloor('');
  }, [selectedFund]);

  // - Используем хук для расчетов -
  const { computed, totalUnits, weights, weightedAvgPerSqm, finalPriceThousand} = useAnalogCalculator(
    analogs,
    evaluatedAreaSqm,
    selectedRegion,
    selectedFund,
    selectedEvalWall,
    selectedEvalHouseCondition,
    selectedEvalFlatCondition,
    selectedEvalBalcony,
    selectedEvalFloor,
    selectedLocationClass
  );

  // - Обработчики -
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

  // - Автоматические корректировки (теперь без региона для стен) -
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
  }, [balconyRegionKey, selectedEvalBalcony, analogs.map(a => a.__analogBalcony || '').join('|')]);

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
        const analogArea = parseNumber(a.areaSqm);
        const evaluatedArea = parseNumber(evaluatedAreaSqm);
        const m = calcAreaMultiplier(evaluatedArea, analogArea);
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

  const isAreaInvalid = evaluatedAreaSqm && (parseNumber(evaluatedAreaSqm) <= 0);
  return (
    <div style={isMobile ? mobileContainerStyle : containerStyle}>
      <h1 style={isMobile ? mobileHeaderStyle : headerStyle}>Расчет стоимости недвижимости</h1>

      {/* Объект оценки */}
      <div style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px', color: '#334155' }}>Объект оценки</h2>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#475569', fontWeight: 600 }}>Регион</label>
            <AnalogSelect
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              options={Object.keys(TRADE_DISCOUNTS)}
              placeholder="Выберите регион"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#475569', fontWeight: 600 }}>Фонд</label>
            <AnalogSelect
              value={selectedFund}
              onChange={(e) => setSelectedFund(e.target.value)}
              options={['Старый фонд', 'Массовое жилье советской постройки', 'Массовое современное жилье', 'Жилье повышенной комфортности']}
              placeholder="Выберите фонд"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginTop: 12 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#475569', fontWeight: 600 }}>Площадь объекта оценки (м²)</label>
            <input
              type="number"
              value={evaluatedAreaSqm}
              onChange={(e) => setEvaluatedAreaSqm(e.target.value)}
              style={{
                ...inputStyle,
                ...(isAreaInvalid ? inputErrorStyle : {})
              }}
              placeholder="Введите площадь"
            />
            {isAreaInvalid && (
              <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                Площадь должна быть больше 0
              </p>
            )}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#475569', fontWeight: 600 }}>Класс местоположения</label>
            <AnalogSelect
              value={selectedLocationClass}
              onChange={(e) => setSelectedLocationClass(e.target.value)}
              options={locationOptions}
              placeholder={selectedRegion && selectedFund ? "Выберите класс" : "—"}
            />
            {!selectedRegion || !selectedFund ? (
              <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>
                Доступно после выбора региона и фонда
              </p>
            ) : null}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ display: 'block', marginBottom: 6, color: '#475569', fontWeight: 600 }}>Материал стен объекта оценки</label>
          <AnalogSelect
            value={selectedEvalWall}
            onChange={(e) => setSelectedEvalWall(e.target.value)}
            options={evalWallOptions}
            placeholder={selectedFund ? "Выберите материал" : "—"}
          />
          {!selectedFund ? (
            <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>
              Доступно после выбора фонда
            </p>
          ) : null}
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ display: 'block', marginBottom: 6, color: '#475569', fontWeight: 600 }}>Техническое состояние дома объекта оценки</label>
          <AnalogSelect
            value={selectedEvalHouseCondition}
            onChange={(e) => setSelectedEvalHouseCondition(e.target.value)}
            options={evalHouseConditionOptions}
            placeholder={selectedRegion && selectedFund ? "Выберите состояние" : "—"}
          />
          {!selectedRegion || !selectedFund ? (
            <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>
              Доступно после выбора региона и фонда
            </p>
          ) : null}
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ display: 'block', marginBottom: 6, color: '#475569', fontWeight: 600 }}>Состояние отделки квартиры объекта оценки</label>
          <AnalogSelect
            value={selectedEvalFlatCondition}
            onChange={(e) => setSelectedEvalFlatCondition(e.target.value)}
            options={evalFlatConditionOptions}
            placeholder={selectedRegion ? "Выберите состояние" : "—"}
          />
          {!selectedRegion ? (
            <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>
              Доступно после выбора региона
            </p>
          ) : null}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginTop: 12 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#475569', fontWeight: 600 }}>Наличие балкона/лоджии у объекта оценки</label>
            <select
              value={selectedEvalBalcony}
              onChange={(e) => setSelectedEvalBalcony(e.target.value)}
              style={selectStyle}
            >
              <option value="">Выберите наличие</option>
              <option value="есть">есть</option>
              <option value="нет">нет</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#475569', fontWeight: 600 }}>Этаж объекта оценки</label>
            <AnalogSelect
              value={selectedEvalFloor}
              onChange={(e) => setSelectedEvalFloor(e.target.value)}
              options={evalFloorOptions}
              placeholder={selectedRegion && selectedFund ? "Выберите этаж" : "—"}
            />
            {!selectedRegion || !selectedFund ? (
              <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>
                Доступно после выбора региона и фонда
            </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Аналоги */}
      <div style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 16px', color: '#334155' }}>Аналоги недвижимости</h2>

        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {analogs.map((_, i) => (
              <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', backgroundColor: '#fff' }}>
                <h3 style={{ marginBottom: '12px', color: '#3b82f6', fontWeight: '600' }}>Аналог {i + 1}</h3>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: 4, color: '#475569', fontWeight: 500 }}>Предложение по цене (тыс. руб.)</label>
                  <AnalogInput
                    value={analogs[i].priceOfferThousand}
                    onChange={fieldHandlers[i].priceOfferThousand}
                    isMobile={isMobile}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: 4, color: '#475569', fontWeight: 500 }}>Площадь (м²)</label>
                  <AnalogInput
                    value={analogs[i].areaSqm}
                    onChange={fieldHandlers[i].areaSqm}
                    isMobile={isMobile}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: 4, color: '#475569', fontWeight: 500 }}>Материал стен аналога</label>
                  <AnalogSelect
                    value={analogs[i].__analogWall || ''}
                    onChange={(e) => fieldHandlers[i].__analogWall(e.target.value)}
                    options={analogWallOptions}
                    placeholder={selectedFund ? "Выберите материал" : "—"}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: 4, color: '#475569', fontWeight: 500 }}>Техсостояние дома аналога</label>
                  <AnalogSelect
                    value={analogs[i].__analogHouseCondition || ''}
                    onChange={(e) => fieldHandlers[i].__analogHouseCondition(e.target.value)}
                    options={analogHouseConditionOptions}
                    placeholder={selectedRegion && selectedFund ? "Выберите состояние" : "—"}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: 4, color: '#475569', fontWeight: 500 }}>Состояние отделки квартиры аналога</label>
                  <AnalogSelect
                    value={analogs[i].__analogFlatCondition || ''}
                    onChange={(e) => fieldHandlers[i].__analogFlatCondition(e.target.value)}
                    options={analogFlatConditionOptions}
                    placeholder={selectedRegion ? "Выберите состояние" : "—"}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: 4, color: '#475569', fontWeight: 500 }}>Наличие балкона/лоджии у аналога</label>
                  <select
                    value={analogs[i].__analogBalcony || ''}
                    onChange={(e) => fieldHandlers[i].__analogBalcony(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="">Выберите наличие</option>
                    <option value="есть">есть</option>
                    <option value="нет">нет</option>
                  </select>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: 4, color: '#475569', fontWeight: 500 }}>Этаж аналога</label>
                  <AnalogSelect
                    value={analogs[i].__analogFloor || ''}
                    onChange={(e) => fieldHandlers[i].__analogFloor(e.target.value)}
                    options={analogFloorOptions}
                    placeholder={selectedRegion && selectedFund ? "Выберите этаж" : "—"}
                  />
                </div>

                {/* Автоматические корректировки */}
                <div style={{ marginTop: '16px', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ marginBottom: '8px', color: '#334155', fontWeight: '600' }}>Корректировки (автоматически)</h4>

                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', marginBottom: 4, color: '#475569', fontWeight: 500 }}>Местоположение</label>
                    <input
                      value={formatNumber(analogs[i].adjLocation) || ''}
                      disabled
                      style={{
                        ...inputStyle,
                        backgroundColor: '#f8fafc',
                        color: '#64748b',
                        cursor: 'not-allowed'
                      }}
                    />
                    <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '4px' }}>⚙️ (авто)</span>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', marginBottom: 4, color: '#475569', fontWeight: 500 }}>Площадь</label>
                    <input
                      value={formatNumber(analogs[i].adjArea) || ''}
                      disabled
                      style={{
                        ...inputStyle,
                        backgroundColor: '#f8fafc',
                        color: '#64748b',
                        cursor: 'not-allowed'
                      }}
                    />
                    <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '4px' }}>⚙️ (авто)</span>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', marginBottom: 4, color: '#475569', fontWeight: 500 }}>Материал стен</label>
                    <input
                      value={formatNumber(analogs[i].adjWalls) || ''}
                      disabled
                      style={{
                        ...inputStyle,
                        backgroundColor: '#f8fafc',
                        color: '#64748b',
                        cursor: 'not-allowed'
                      }}
                    />
                    <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '4px' }}>⚙️ (авто)</span>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', marginBottom: 4, color: '#475569', fontWeight: 500 }}>Техсостояние дома</label>
                    <input
                      value={formatNumber(analogs[i].adjHouseCondition) || ''}
                      disabled
                      style={{
                        ...inputStyle,
                        backgroundColor: '#f8fafc',
                        color: '#64748b',
                        cursor: 'not-allowed'
                      }}
                    />
                    <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '4px' }}>⚙️ (авто)</span>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', marginBottom: 4, color: '#475569', fontWeight: 500 }}>Техсостояние квартиры</label>
                    <input
                      value={formatNumber(analogs[i].adjFlatCondition) || ''}
                      disabled
                      style={{
                        ...inputStyle,
                        backgroundColor: '#f8fafc',
                        color: '#64748b',
                        cursor: 'not-allowed'
                      }}
                    />
                    <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '4px' }}>⚙️ (авто)</span>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', marginBottom: 4, color: '#475569', fontWeight: 500 }}>Этажность</label>
                    <input
                      value={formatNumber(analogs[i].adjFloors) || ''}
                      disabled
                      style={{
                        ...inputStyle,
                        backgroundColor: '#f8fafc',
                        color: '#64748b',
                        cursor: 'not-allowed'
                      }}
                    />
                    <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '4px' }}>⚙️ (авто)</span>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'block', marginBottom: 4, color: '#475569', fontWeight: 500 }}>Балкон/лоджия</label>
                    <input
                      value={formatNumber(analogs[i].adjBalcony) || ''}
                      disabled
                      style={{
                        ...inputStyle,
                        backgroundColor: '#f8fafc',
                        color: '#64748b',
                        cursor: 'not-allowed'
                      }}
                    />
                    <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '4px' }}>⚙️ (авто)</span>
                  </div>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <label style={{ display: 'block', marginBottom: 4, color: '#475569', fontWeight: 500 }}>Количество единиц</label>
                  <AnalogInput
                    value={analogs[i].units}
                    step="1"
                    placeholder="1"
                    onChange={fieldHandlers[i].units}
                    isMobile={isMobile}
                  />
                </div>

                <div style={{ marginTop: '12px' }}>
                  <label style={{ display: 'block', marginBottom: 4, color: '#475569', fontWeight: 500 }}>Стоимость за м² (тыс. руб.)</label>
                  <span
                    style={{
                      color: '#059669',
                      fontWeight: '600',
                      fontSize: '13px',
                      backgroundColor: '#f0fdf4',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid #bbf7d0',
                    }}
                  >
                    {formatNumber(computed[i]?.pricePerSqm || '')}
                  </span>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <label style={{ display: 'block', marginBottom: 4, color: '#475569', fontWeight: 500 }}>Вес аналога</label>
                  <span
                    style={{
                      color: '#7c2d12',
                      fontWeight: '600',
                      fontSize: '13px',
                      backgroundColor: '#fef2f2',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid #fecaca',
                    }}
                  >
                    {formatNumber(weights[i] || '')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={tableContainerStyle}>
            <table style={tableStyle}>
              <thead style={theadStyle}>
                <tr>
                  <th style={thStyle}></th>
                  <th style={analogHeaderStyle}>Аналог 1</th>
                  <th style={analogHeaderStyle}>Аналог 2</th>
                  <th style={analogHeaderStyle}>Аналог 3</th>
                </tr>
              </thead>
              <tbody>
                <AnalogRow
                  label="Предложение по цене (тыс. руб.)"
                  inputs={analogs.map((a, i) => (
                    <AnalogInput
                      key={i}
                      value={a.priceOfferThousand}
                      onChange={fieldHandlers[i].priceOfferThousand}
                      isMobile={isMobile}
                    />
                  ))}
                  isMobile={isMobile}
                />
                <AnalogRow
                  label="Площадь (м²)"
                  inputs={analogs.map((a, i) => (
                    <AnalogInput
                      key={i}
                      value={a.areaSqm}
                      onChange={fieldHandlers[i].areaSqm}
                      isMobile={isMobile}
                    />
                  ))}
                  isMobile={isMobile}
                />
                <AnalogRow
                  label="Материал стен аналога"
                  inputs={analogs.map((a, i) => (
                    <AnalogSelect
                      key={i}
                      value={a.__analogWall || ''}
                      onChange={(e) => fieldHandlers[i].__analogWall(e.target.value)}
                      options={analogWallOptions}
                      placeholder={selectedFund ? "Выберите материал" : "—"}
                    />
                  ))}
                  isMobile={isMobile}
                />
                <AnalogRow
                  label="Техсостояние дома аналога"
                  inputs={analogs.map((a, i) => (
                    <AnalogSelect
                      key={i}
                      value={a.__analogHouseCondition || ''}
                      onChange={(e) => fieldHandlers[i].__analogHouseCondition(e.target.value)}
                      options={analogHouseConditionOptions}
                      placeholder={selectedRegion && selectedFund ? "Выберите состояние" : "—"}
                    />
                  ))}
                  isMobile={isMobile}
                />
                <AnalogRow
                  label="Состояние отделки квартиры аналога"
                  inputs={analogs.map((a, i) => (
                    <AnalogSelect
                      key={i}
                      value={a.__analogFlatCondition || ''}
                      onChange={(e) => fieldHandlers[i].__analogFlatCondition(e.target.value)}
                      options={analogFlatConditionOptions}
                      placeholder={selectedRegion ? "Выберите состояние" : "—"}
                    />
                  ))}
                  isMobile={isMobile}
                />
                <AnalogRow
                  label="Наличие балкона/лоджии у аналога"
                  inputs={analogs.map((a, i) => (
                    <select
                      key={i}
                      value={a.__analogBalcony || ''}
                      onChange={(e) => fieldHandlers[i].__analogBalcony(e.target.value)}
                      style={selectStyle}
                    >
                      <option value="">Выберите наличие</option>
                      <option value="есть">есть</option>
                      <option value="нет">нет</option>
                    </select>
                  ))}
                  isMobile={isMobile}
                />
                <AnalogRow
                  label="Этаж аналога"
                  inputs={analogs.map((a, i) => (
                    <AnalogSelect
                      key={i}
                      value={a.__analogFloor || ''}
                      onChange={(e) => fieldHandlers[i].__analogFloor(e.target.value)}
                      options={analogFloorOptions}
                      placeholder={selectedRegion && selectedFund ? "Выберите этаж" : "—"}
                    />
                  ))}
                  isMobile={isMobile}
                />
                <AnalogRow
                  label="Стоимость за м² (тыс. руб.)"
                  inputs={computed.map((c, i) => (
                    <span
                      key={i}
                      style={{
                        color: '#059669',
                        fontWeight: '600',
                        fontSize: '13px',
                        backgroundColor: '#f0fdf4',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #bbf7d0',
                      }}
                    >
                      {formatNumber(c.pricePerSqm)}
                    </span>
                  ))}
                  isHighlight={true}
                  isMobile={isMobile}
                />
                <tr>
                  <td colSpan={4} style={sectionDividerStyle}></td>
                </tr>
                {[
                  { field: 'adjRights', label: 'Корректировка на права КОНСТАНТА' },
                  { field: 'adjFinance', label: 'Корректировка на финансовые условия КОНСТАНТА' },
                  { field: 'adjSaleDate', label: 'Корректировка на дату продажи КОНСТАНТА' },
                  { field: 'adjTrade', label: 'Корректировка на торги КОНСТАНТА' },
                  { field: 'adjLocation', label: 'Корректировка на местоположение ⚙️ (авто)', isAuto: true },
                  { field: 'adjArea', label: 'Корректировка на площадь ⚙️ (авто)', isAuto: true },
                  { field: 'adjWalls', label: 'Корректировка на материал стен ⚙️ (авто)', isAuto: true },
                  { field: 'adjCommunications', label: 'Корректировка на коммуникации' },
                  { field: 'adjHouseCondition', label: 'Корректировка на техсостояние дома ⚙️ (авто)', isAuto: true },
                  { field: 'adjFloors', label: 'Корректировка на этажность ⚙️ (авто)', isAuto: true },
                  { field: 'adjBalcony', label: 'Корректировка на балкон/лоджию ⚙️ (авто)', isAuto: true },
                ].map((row) => (
                  <AnalogRow
                    key={row.field}
                    label={row.label}
                    inputs={analogs.map((a, i) => (
                      <AnalogInput
                        key={i}
                        value={a[row.field]}
                        step="0.0001"
                        placeholder="1.0000"
                        onChange={fieldHandlers[i][row.field]}
                        resultValue=""
                        label="="
                        isMobile={isMobile}
                        disabled={row.isAuto}
                      />
                    ))}
                    isMobile={isMobile}
                  />
                ))}
                <AnalogRow
                  label="Корректировка на техническое состояние квартиры ⚙️ (авто)"
                  inputs={analogs.map((a, i) => {
                    const m = flatConditionRegionKey ? calcFlatConditionMultiplier(flatConditionRegionKey, selectedEvalFlatCondition, a.__analogFlatCondition) : null;
                    const resultValue = formatNumber(computed[i].steps.find(s => s.key === 'flatCondition')?.value);
                    return (
                      <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <AnalogInput
                          value={a.adjFlatCondition}
                          step="0.0001"
                          placeholder="1.0000"
                          onChange={fieldHandlers[i].adjFlatCondition}
                          resultValue={resultValue}
                          label="="
                          isMobile={isMobile}
                          disabled={true}
                        />
                      </div>
                    );
                  })}
                  isMobile={isMobile}
                />
                <tr>
                  <td colSpan={4} style={sectionDividerStyle}></td>
                </tr>
                <AnalogRow
                  label="Количество единиц"
                  inputs={analogs.map((a, i) => {
                    return (
                      <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <AnalogInput
                          value={a.units}
                          step="1"
                          placeholder="1"
                          onChange={fieldHandlers[i].units}
                          resultValue={formatNumber(parseNumber(a.units))}
                          label="="
                          isMobile={isMobile}
                        />
                      </div>
                    );
                  })}
                  isMobile={isMobile}
                />
                <AnalogRow
                  label="Вес аналога"
                  inputs={weights.map((w, i) => (
                    <span
                      key={i}
                      style={{
                        color: '#7c2d12',
                        fontWeight: '600',
                        fontSize: '13px',
                        backgroundColor: '#fef2f2',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #fecaca',
                      }}
                    >
                      {formatNumber(w)}
                    </span>
                  ))}
                  isResult={true}
                  isMobile={isMobile}
                />
                <ResultRow
                  label="💰 Средневзвешенная стоимость за м² (тыс. руб.)"
                  value={formatNumber(weightedAvgPerSqm)}
                  colSpan={3}
                  isMobile={isMobile}
                />
                <ResultRow
                  label="💰 Итоговая стоимость объекта оценки (тыс. руб.)"
                  value={formatNumber(finalPriceThousand)}
                  colSpan={3}
                  isMobile={isMobile}
                />
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;