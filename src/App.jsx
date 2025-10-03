// src/App.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useResponsive } from './hooks/useResponsive';
import { useAnalogCalculator } from './hooks/useAnalogCalculator';
import AnalogInput from './components/AnalogInput';
import AnalogSelect from './components/AnalogSelect';
import AnalogRow from './components/AnalogRow';
import ResultRow from './components/ResultRow';
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
  noteStyle
} from './styles';
// Импортируем систему справочников
import { DATA_SOURCES, getDefaultHandbookId, getAvailableHandbooks } from './data/dataSources';

const App = () => {
  const { isMobile } = useResponsive();

  // --- Состояние настроек ---
  const [selectedHandbookId, setSelectedHandbookId] = useState(getDefaultHandbookId());
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedFund, setSelectedFund] = useState('');
  const [selectedLocationClass, setSelectedLocationClass] = useState('');
  const [selectedEvalWall, setSelectedEvalWall] = useState('');
  const [selectedEvalHouseCondition, setSelectedEvalHouseCondition] = useState('');
  const [selectedEvalFlatCondition, setSelectedEvalFlatCondition] = useState('');
  const [selectedEvalBalcony, setSelectedEvalBalcony] = useState('');
  const [selectedEvalFloor, setSelectedEvalFloor] = useState('');
  const [evaluatedAreaSqm, setEvaluatedAreaSqm] = useState(46.7);

  // Получаем текущий справочник
  const currentHandbook = DATA_SOURCES[selectedHandbookId];
  const availableHandbooks = getAvailableHandbooks();

  // --- Эффекты для сброса зависимых полей ---
  useEffect(() => {
    // При изменении справочника сбрасываем регион и все зависимые поля
    setSelectedRegion('');
    setSelectedFund('');
    setSelectedLocationClass('');
    setSelectedEvalWall('');
    setSelectedEvalHouseCondition('');
    setSelectedEvalFlatCondition('');
    setSelectedEvalBalcony('');
    setSelectedEvalFloor('');
  }, [selectedHandbookId]); // Обновлена зависимость

  useEffect(() => {
    // При изменении региона сбрасываем фонд и все зависимые поля
    setSelectedFund('');
    setSelectedLocationClass('');
    setSelectedEvalWall('');
    setSelectedEvalHouseCondition('');
    setSelectedEvalFlatCondition('');
    setSelectedEvalFloor('');
  }, [selectedRegion]);

  useEffect(() => {
    // При изменении фонда сбрасываем зависимые поля
    setSelectedLocationClass('');
    setSelectedEvalWall('');
    setSelectedEvalHouseCondition('');
    setSelectedEvalFloor('');
  }, [selectedFund]);

  // --- Используем хук для расчетов ---
  const { analogs, computed, totalUnits, weights, weightedAvgPerSqm, finalPriceThousand, fieldHandlers } = useAnalogCalculator(
    evaluatedAreaSqm, selectedRegion, selectedFund, selectedEvalWall, selectedEvalHouseCondition, selectedEvalFlatCondition, selectedEvalBalcony, selectedEvalFloor, selectedLocationClass, currentHandbook
  );

  // --- Вспомогательные вычисления для UI ---
  const locationRegionKey = useMemo(() => currentHandbook?.logic.resolveLocationRegionKey(selectedRegion), [selectedRegion, currentHandbook]);
  const locationFundKey = useMemo(() => currentHandbook?.logic.resolveLocationFundGroupKey(selectedFund), [selectedFund, currentHandbook]);
  const locationOptions = useMemo(() => {
    const group = locationRegionKey ? currentHandbook?.data.LOCATION_COEFFICIENTS[locationRegionKey]?.[locationFundKey] : null;
    return group ? Object.keys(group) : [];
  }, [locationRegionKey, locationFundKey, currentHandbook]);

  const wallsRegionKey = useMemo(() => currentHandbook?.logic.resolveWallsRegionKey(selectedRegion), [selectedRegion, currentHandbook]);
  const wallsFundKey = useMemo(() => currentHandbook?.logic.resolveWallsFundGroupKey(selectedFund), [selectedFund, currentHandbook]);
  const evalWallOptions = useMemo(() => (wallsRegionKey && wallsFundKey ? currentHandbook?.logic.getEvalWallOptions(wallsRegionKey, wallsFundKey) : []), [wallsRegionKey, wallsFundKey, currentHandbook]);
  const analogWallOptions = useMemo(() => (wallsRegionKey && wallsFundKey ? currentHandbook?.logic.getAnalogWallOptions(wallsRegionKey, wallsFundKey, selectedEvalWall) : []), [wallsRegionKey, wallsFundKey, selectedEvalWall, currentHandbook]);

  const houseConditionRegionKey = useMemo(() => currentHandbook?.logic.resolveHouseConditionRegionKey(selectedRegion), [selectedRegion, currentHandbook]);
  const houseConditionFundKey = useMemo(() => currentHandbook?.logic.resolveHouseConditionFundGroupKey(selectedFund), [selectedFund, currentHandbook]);
  const evalHouseConditionOptions = useMemo(() => (houseConditionRegionKey && houseConditionFundKey ? currentHandbook?.logic.getEvalHouseConditionOptions(houseConditionRegionKey, houseConditionFundKey) : []), [houseConditionRegionKey, houseConditionFundKey, currentHandbook]);
  const analogHouseConditionOptions = useMemo(() => (houseConditionRegionKey && houseConditionFundKey ? currentHandbook?.logic.getAnalogHouseConditionOptions(houseConditionRegionKey, houseConditionFundKey, selectedEvalHouseCondition) : []), [houseConditionRegionKey, houseConditionFundKey, selectedEvalHouseCondition, currentHandbook]);

  const flatConditionRegionKey = useMemo(() => currentHandbook?.logic.resolveFlatConditionRegionKey(selectedRegion), [selectedRegion, currentHandbook]);
  const evalFlatConditionOptions = useMemo(() => (flatConditionRegionKey ? currentHandbook?.logic.getEvalFlatConditionOptions(flatConditionRegionKey) : []), [flatConditionRegionKey, currentHandbook]);
  const analogFlatConditionOptions = useMemo(() => (flatConditionRegionKey ? currentHandbook?.logic.getAnalogFlatConditionOptions(flatConditionRegionKey, selectedEvalFlatCondition) : []), [flatConditionRegionKey, selectedEvalFlatCondition, currentHandbook]);

  const balconyRegionKey = useMemo(() => currentHandbook?.logic.resolveBalconyRegionKey(selectedRegion), [selectedRegion, currentHandbook]);
  const floorRegionKey = useMemo(() => currentHandbook?.logic.resolveFloorRegionKey(selectedRegion), [selectedRegion, currentHandbook]);
  const floorFundKey = useMemo(() => currentHandbook?.logic.resolveFloorFundGroupKey(selectedFund), [selectedFund, currentHandbook]);
  const evalFloorOptions = useMemo(() => (floorRegionKey && floorFundKey ? currentHandbook?.logic.getEvalFloorOptions(floorRegionKey, floorFundKey) : []), [floorRegionKey, floorFundKey, currentHandbook]);
  const analogFloorOptions = useMemo(() => (floorRegionKey && floorFundKey ? currentHandbook?.logic.getAnalogFloorOptions(floorRegionKey, floorFundKey, selectedEvalFloor) : []), [floorRegionKey, floorFundKey, selectedEvalFloor, currentHandbook]);

  // --- Рендер ---
  return (
    <div style={{...containerStyle, ...(isMobile ? mobileContainerStyle : {})}}>
      <h1 style={{...headerStyle, ...(isMobile ? mobileHeaderStyle : {})}}>
        Таблица оценки (сравнительный подход)
      </h1>
      {/* Блок настроек объекта оценки */}
      <div style={{ ...tableContainerStyle, padding: '16px' }}>
        {/* Выбор справочника */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6, color: '#475569', fontWeight: 600 }}>Справочник</label>
          <select value={selectedHandbookId} onChange={(e) => setSelectedHandbookId(e.target.value)} style={selectStyle}>
            {availableHandbooks.map((handbook) => (
              <option key={handbook.id} value={handbook.id}>{handbook.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6, color: '#475569', fontWeight: 600 }}>Площадь оцениваемой квартиры (м²)</label>
          <input
            type="number"
            value={evaluatedAreaSqm}
            step="0.01"
            min="0"
            placeholder="0.00"
            onChange={(e) => setEvaluatedAreaSqm(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#475569', fontWeight: 600 }}>Регион</label>
            <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} style={selectStyle} disabled={!currentHandbook}>
              <option value="">{currentHandbook ? 'Выберите регион' : 'Справочник не выбран'}</option>
              {Object.keys(currentHandbook?.data.TRADE_DISCOUNTS || {}).map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#475569', fontWeight: 600 }}>Фонд</label>
            <select value={selectedFund} onChange={(e) => setSelectedFund(e.target.value)} style={selectStyle} disabled={!selectedRegion}>
              <option value="">{selectedRegion ? 'Выберите фонд' : 'Сначала выберите регион'}</option>
              {Object.keys(currentHandbook?.data.TRADE_DISCOUNTS[selectedRegion] || {}).map((fund) => (
                <option key={fund} value={fund}>{fund}</option>
              ))}
            </select>
          </div>
          {/* Здесь можно отобразить информацию о торговой скидке */}
        </div>
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, color: '#475569', fontWeight: 600 }}>Класс местоположения</label>
            <AnalogSelect
              value={selectedLocationClass}
              onChange={(e) => setSelectedLocationClass(e.target.value)}
              options={locationOptions}
              placeholder={selectedRegion && selectedFund ? "Выберите класс местоположения" : "Сначала выберите регион и фонд"}
            />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={{ display: 'block', marginBottom: 6, color: '#475569', fontWeight: 600 }}>Материал стен объекта оценки</label>
          <AnalogSelect
            value={selectedEvalWall}
            onChange={(e) => setSelectedEvalWall(e.target.value)}
            options={evalWallOptions}
            placeholder={selectedRegion && selectedFund ? "Выберите материал стен" : "Сначала выберите регион и фонд"}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={{ display: 'block', marginBottom: 6, color: '#475569', fontWeight: 600 }}>Техсостояние дома объекта оценки</label>
          <AnalogSelect
            value={selectedEvalHouseCondition}
            onChange={(e) => setSelectedEvalHouseCondition(e.target.value)}
            options={evalHouseConditionOptions}
            placeholder={selectedRegion && selectedFund ? "Выберите техсостояние дома" : "Сначала выберите регион и фонд"}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={{ display: 'block', marginBottom: 6, color: '#475569', fontWeight: 600 }}>Состояние отделки квартиры объекта оценки</label>
          <AnalogSelect
            value={selectedEvalFlatCondition}
            onChange={(e) => setSelectedEvalFlatCondition(e.target.value)}
            options={evalFlatConditionOptions}
            placeholder={selectedRegion ? "Выберите состояние отделки" : "Сначала выберите регион"}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={{ display: 'block', marginBottom: 6, color: '#475569', fontWeight: 600 }}>Наличие балкона/лоджии у объекта оценки</label>
          <select value={selectedEvalBalcony} onChange={(e) => setSelectedEvalBalcony(e.target.value)} style={selectStyle}>
            <option value="">Выберите наличие балкона</option>
            <option value="есть">есть</option>
            <option value="нет">нет</option>
          </select>
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={{ display: 'block', marginBottom: 6, color: '#475569', fontWeight: 600 }}>Этаж объекта оценки</label>
          <AnalogSelect
            value={selectedEvalFloor}
            onChange={(e) => setSelectedEvalFloor(e.target.value)}
            options={evalFloorOptions}
            placeholder={selectedRegion && selectedFund ? "Выберите этаж" : "Сначала выберите регион и фонд"}
          />
        </div>
      </div>
      {/* Основная таблица */}
      <div style={tableContainerStyle}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{...tableStyle, ...(isMobile ? mobileTableStyle : {})}}>
            <thead style={theadStyle}>
              <tr>
                <th style={{...thStyle, ...(isMobile ? mobileThStyle : {})}}>
                  Показатель
                </th>
                {[0, 1, 2].map((i) => (
                  <th key={i} style={{...thStyle, ...analogHeaderStyle, ...(isMobile ? mobileThStyle : {})}}>
                    Аналог {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnalogRow
                label="Цена предложения (тыс. руб.)"
                inputs={analogs.map((a, i) => (
                  <AnalogInput
                    key={i}
                    value={a.priceOfferThousand}
                    step="0.01"
                    placeholder="0.00"
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
                    step="0.01"
                    min="0"
                    placeholder="0.00"
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
                    placeholder={selectedRegion && selectedFund ? "Выберите материал стен" : "Сначала выберите регион и фонд"}
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
                    placeholder={selectedRegion && selectedFund ? "Выберите техсостояние дома" : "Сначала выберите регион и фонд"}
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
                    placeholder={selectedRegion ? "Выберите состояние отделки" : "Сначала выберите регион"}
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
                    <option value="">Выберите наличие балкона</option>
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
                    placeholder={selectedRegion && selectedFund ? "Выберите этаж" : "Сначала выберите регион и фонд"}
                  />
                ))}
                isMobile={isMobile}
              />
              <AnalogRow
                label="Стоимость за м² (тыс. руб.)"
                inputs={computed.map((c, i) => (
                  <span key={i} style={{
                    color: '#059669',
                    fontWeight: '600',
                    fontSize: '13px',
                    backgroundColor: '#f0fdf4',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #bbf7d0',
                  }}>
                    {currentHandbook?.logic.formatNumber(c.pricePerSqm)}
                  </span>
                ))}
                isHighlight={true}
                isMobile={isMobile}
              />
              <tr>
                <td colSpan={4} style={sectionDividerStyle}></td>
              </tr>
              {[
                { field: 'adjRights', label: 'Права (всегда 1)', readonly: true },
                { field: 'adjFinance', label: 'Финансовые условия (всегда 1)', readonly: true },
                { field: 'adjSaleDate', label: 'Дата продажи (всегда 1)', readonly: true },
                { field: 'adjTrade', label: 'Корректировка на торг' },
                { field: 'adjLocation', label: 'Корректировка на местоположение' },
                { field: 'adjArea', label: 'Корректировка на площадь квартиры' },
                { field: 'adjWalls', label: 'Корректировка на материал стен' },
                { field: 'adjCommunications', label: 'Корректировка на коммуникации' },
                { field: 'adjHouseCondition', label: 'Корректировка на техсостояние дома' },
                { field: 'adjFloors', label: 'Корректировка на этажность' },
                { field: 'adjBalcony', label: 'Корректировка на балкон/лоджию' },
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
                      resultValue={currentHandbook?.logic.formatNumber(computed[i].steps.find(s => s.key === row.field)?.value)}
                      label="="
                      isMobile={isMobile}
                    />
                  ))}
                  isMobile={isMobile}
                />
              ))}
              <AnalogRow
                label="Корректировка на техническое состояние квартиры"
                inputs={analogs.map((a, i) => {
                  const m = balconyRegionKey ? currentHandbook?.logic.calcFlatConditionMultiplier(balconyRegionKey, selectedEvalFlatCondition, a.__analogFlatCondition) : null;
                  const resultValue = currentHandbook?.logic.formatNumber(computed[i].steps.find(s => s.key === 'flatCondition')?.value);
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
                label="Итоговая скорректированная стоимость за м² (тыс. руб.)"
                inputs={computed.map((c, i) => (
                  <span key={i} style={{
                    color: '#059669',
                    fontWeight: '600',
                    fontSize: '13px',
                    backgroundColor: '#f0fdf4',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #bbf7d0',
                  }}>
                    {currentHandbook?.logic.formatNumber(c.finalAdjustedPerSqm)}
                  </span>
                ))}
                isResult={true}
                isMobile={isMobile}
              />
              <AnalogRow
                label="Количество единиц"
                inputs={analogs.map((a, i) => (
                  <AnalogInput
                    key={i}
                    value={a.units}
                    step="1"
                    placeholder="0"
                    onChange={fieldHandlers[i].units}
                    isMobile={isMobile}
                  />
                ))}
                isMobile={isMobile}
              />
              <AnalogRow
                label="Общее количество единиц"
                inputs={[
                  <span key="total" style={{
                    color: '#059669',
                    fontWeight: '600',
                    fontSize: '13px',
                    backgroundColor: '#f0fdf4',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #bbf7d0',
                  }}>
                    {currentHandbook?.logic.formatNumber(totalUnits, 0)}
                  </span>
                ]}
                colSpan={3}
                isResult={true}
                isMobile={isMobile}
              />
              <AnalogRow
                label="Вес аналога"
                inputs={weights.map((w, i) => (
                  <span key={i} style={{
                    color: '#059669',
                    fontWeight: '600',
                    fontSize: '13px',
                    backgroundColor: '#f0fdf4',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #bbf7d0',
                  }}>
                    {currentHandbook?.logic.formatNumber(w, 4)}
                  </span>
                ))}
                isMobile={isMobile}
              />
              <AnalogRow
                label="Скорректированная цена × вес (тыс. руб./м²)"
                inputs={computed.map((c, i) => (
                  <span key={i} style={{
                    color: '#059669',
                    fontWeight: '600',
                    fontSize: '13px',
                    backgroundColor: '#f0fdf4',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #bbf7d0',
                  }}>
                    {currentHandbook?.logic.formatNumber(c.finalAdjustedPerSqm * (weights[i] || 0))}
                  </span>
                ))}
                isMobile={isMobile}
              />
              <AnalogRow
                label="Средневзвешенная скорректированная стоимость за м² (тыс. руб.)"
                inputs={[
                  <span key="avg" style={{
                    color: '#059669',
                    fontWeight: '600',
                    fontSize: '13px',
                    backgroundColor: '#f0fdf4',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #bbf7d0',
                  }}>
                    {currentHandbook?.logic.formatNumber(weightedAvgPerSqm)}
                  </span>
                ]}
                colSpan={3}
                isResult={true}
                isMobile={isMobile}
              />
              <tr>
                <td colSpan={4} style={sectionDividerStyle}></td>
              </tr>
              <ResultRow
                label="Итоговая стоимость квартиры (тыс. руб.)"
                value={currentHandbook?.logic.formatNumber(finalPriceThousand)}
                colSpan={3}
                isMobile={isMobile}
              />
            </tbody>
          </table>
        </div>
      </div>
      <div style={noteStyle}>
        <strong>Примечание:</strong> Все цены указаны в тысячах рублей. Корректировки применяются последовательно к стоимости за м².
      </div>
    </div>
  );
};

export default App;
