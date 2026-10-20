import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Cargar variables de .env manualmente si no están en process.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

import { getUnavailableDateRanges } from '../src/lib/ical.ts';

async function verify() {
  console.log('===============================================================');
  console.log(' VERIFICACIÓN DE SINCRONIZACIÓN iCAL: BOOKING + AIRBNB');
  console.log('===============================================================');
  console.log('BOOKING_ICAL_URL:', process.env.BOOKING_ICAL_URL);
  console.log('AIRBNB_ICAL_URL: ', process.env.AIRBNB_ICAL_URL);
  console.log('\nConsultando feeds oficiales en paralelo...');

  const startTime = Date.now();
  const ranges = await getUnavailableDateRanges(true);
  const elapsed = Date.now() - startTime;

  console.log(`\n✓ Sincronización completada en ${elapsed}ms`);
  console.log(`✓ Total de periodos bloqueados consolidados (sin duplicados): ${ranges.length}\n`);

  console.log('--- DETALLE DE PERIODOS FUSIONADOS ---');
  ranges.forEach((r, idx) => {
    console.log(`[${idx + 1}] Del ${r.start} al ${r.end}`);
    console.log(`    Canal(es): ${r.source}`);
    console.log(`    Motivo:    ${r.summary}\n`);
  });

  console.log('--- SIMULACIÓN DE RESPUESTA /api/availability.json ---');
  const mockApiResponse = {
    success: true,
    property: 'Apartamento Costa del Sol Suances',
    pricePerNight: Number(process.env.DEFAULT_PRICE_PER_NIGHT) || 110,
    cleaningFee: Number(process.env.CLEANING_FEE) || 40,
    minStay: Number(process.env.MINIMUM_STAY_NIGHTS) || 2,
    totalBlockedPeriods: ranges.length,
    unavailable: ranges
  };

  console.log(JSON.stringify(mockApiResponse, null, 2));
  console.log('===============================================================');
}

verify().catch(err => {
  console.error('Error durante la verificación:', err);
  process.exit(1);
});

