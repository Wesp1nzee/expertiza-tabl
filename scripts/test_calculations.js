import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import {
  resolveHouseConditionRegionKey,
  getEvalHouseConditionOptions,
  resolveFlatConditionRegionKey,
  getEvalFlatConditionOptions,
  resolveFloorRegionKey,
  resolveFloorFundGroupKey,
  getEvalFloorOptions,
} from '../src/utils/calculations.js';

function test(region, fund) {
  console.log('--- Testing', region, '|', fund, '---');
  const houseRegionKey = resolveHouseConditionRegionKey(region);
  console.log('houseRegionKey ->', houseRegionKey);
  console.log('house options ->', getEvalHouseConditionOptions(houseRegionKey, 'Старый фонд, Массовое жилье советской постройки, Массовое современное жилье'));

  const flatRegionKey = resolveFlatConditionRegionKey(region);
  console.log('flatRegionKey ->', flatRegionKey);
  console.log('flat options ->', getEvalFlatConditionOptions(flatRegionKey));

  const floorRegionKey = resolveFloorRegionKey(region);
  const floorFundKey = resolveFloorFundGroupKey(fund);
  console.log('floorRegionKey ->', floorRegionKey);
  console.log('floorFundKey ->', floorFundKey);
  console.log('floor options ->', getEvalFloorOptions(floorRegionKey, floorFundKey));
  console.log('');
}

const region = 'Города с численностью населения до 500 тыс. чел.';

test(region, 'Старый фонд');
test(region, 'Массовое современное жилье');
