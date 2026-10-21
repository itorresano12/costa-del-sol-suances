/**
 * Matriz de Precios por Temporadas y Tarifas Directas
 * Apartamento Costa del Sol Suances
 */

export type SeasonType = 'low' | 'mid' | 'high';

export interface SeasonInfo {
  type: SeasonType;
  name: string;
  directPricePerNight: number;
  otaReferencePrice: number;
}

export const SEASON_RATES: Record<SeasonType, SeasonInfo> = {
  low: {
    type: 'low',
    name: 'Temporada Baja (Octubre a Mayo)',
    directPricePerNight: 95,
    otaReferencePrice: 106,
  },
  mid: {
    type: 'mid',
    name: 'Temporada Media (Junio, Septiembre & Puentes)',
    directPricePerNight: 135,
    otaReferencePrice: 150,
  },
  high: {
    type: 'high',
    name: 'Temporada Alta (Julio, Agosto & Semana Santa)',
    directPricePerNight: 180,
    otaReferencePrice: 200,
  },
};

export const CLEANING_FEE = 40;

/**
 * Determina la temporada para una fecha concreta (noche de estancia)
 */
export function getSeasonForDate(dateInput: Date | string): SeasonType {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const month = d.getMonth(); // 0 = Enero, 11 = Diciembre
  const day = d.getDate();
  const year = d.getFullYear();

  // 1. Temporada Alta: Julio (6) y Agosto (7)
  if (month === 6 || month === 7) {
    return 'high';
  }

  // 2. Temporada Alta: Semana Santa (según calendario anual)
  // 2026: 27 marzo al 6 abril | 2027: 21 al 30 marzo
  if (year === 2026 && ((month === 2 && day >= 27) || (month === 3 && day <= 6))) {
    return 'high';
  }
  if (year === 2027 && month === 2 && day >= 21 && day <= 30) {
    return 'high';
  }
  // Para otros años, ventana aproximada de Semana Santa
  if ((month === 2 && day >= 25) || (month === 3 && day <= 8)) {
    return 'high';
  }

  // 3. Temporada Media: Junio (5) y Septiembre (8)
  if (month === 5 || month === 8) {
    return 'mid';
  }

  // 4. Temporada Media: Puentes y Festivos Nacionales señalados
  // Puente de Mayo (30 Abril a 3 Mayo)
  if ((month === 3 && day === 30) || (month === 4 && day <= 3)) {
    return 'mid';
  }
  // Puente del Pilar / Hispanidad (10 al 13 Octubre)
  if (month === 9 && day >= 10 && day <= 13) {
    return 'mid';
  }
  // Puente de Todos los Santos (30 Octubre al 2 Noviembre)
  if ((month === 9 && day >= 30) || (month === 10 && day <= 2)) {
    return 'mid';
  }
  // Puente de la Constitución y la Inmaculada (4 al 9 Diciembre)
  if (month === 11 && day >= 4 && day <= 9) {
    return 'mid';
  }
  // Nochevieja y Año Nuevo (30 Diciembre al 2 Enero)
  if ((month === 11 && day >= 30) || (month === 0 && day <= 2)) {
    return 'mid';
  }

  // 5. Resto del año: Temporada Baja con tarifa base y 10% ya aplicado
  return 'low';
}

export interface StayPricingBreakdown {
  checkIn: string;
  checkOut: string;
  nights: number;
  stayTotal: number;
  cleaningFee: number;
  grandTotal: number;
  depositAmount: number;   // 50% anticipo
  remainingAmount: number; // 50% restante antes de entrar
  savingsVsOta: number;    // 10% de ahorro directo garantizado
  averagePricePerNight: number;
  primarySeason: SeasonType;
  nightlyBreakdown: { date: string; season: SeasonType; price: number }[];
}

/**
 * Calcula el desglose completo de una estancia según las fechas seleccionadas
 */
export function calculateStayPricing(checkInStr: string, checkOutStr: string): StayPricingBreakdown {
  const start = new Date(checkInStr);
  const end = new Date(checkOutStr);

  const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const nightlyBreakdown: { date: string; season: SeasonType; price: number }[] = [];
  let stayTotal = 0;
  const seasonCount: Record<SeasonType, number> = { low: 0, mid: 0, high: 0 };

  const current = new Date(start);
  for (let i = 0; i < nights; i++) {
    const season = getSeasonForDate(current);
    const price = SEASON_RATES[season].directPricePerNight;
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');

    nightlyBreakdown.push({
      date: `${y}-${m}-${d}`,
      season,
      price,
    });

    stayTotal += price;
    seasonCount[season]++;
    current.setDate(current.getDate() + 1);
  }

  // Determinar temporada predominante
  let primarySeason: SeasonType = 'low';
  if (seasonCount.high > 0 && seasonCount.high >= seasonCount.mid) {
    primarySeason = 'high';
  } else if (seasonCount.mid > 0) {
    primarySeason = 'mid';
  }

  const grandTotal = stayTotal + CLEANING_FEE;
  const depositAmount = Math.round(grandTotal * 0.5);
  const remainingAmount = grandTotal - depositAmount;
  // Ahorro del 10% directo garantizado frente a tarifas OTA
  const savingsVsOta = Math.round(grandTotal * 0.10);
  const averagePricePerNight = Math.round(stayTotal / nights);

  return {
    checkIn: checkInStr,
    checkOut: checkOutStr,
    nights,
    stayTotal,
    cleaningFee: CLEANING_FEE,
    grandTotal,
    depositAmount,
    remainingAmount,
    savingsVsOta,
    averagePricePerNight,
    primarySeason,
    nightlyBreakdown,
  };
}

