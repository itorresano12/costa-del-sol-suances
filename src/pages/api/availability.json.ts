export const prerender = false;

import type { APIRoute } from 'astro';
import { getUnavailableDateRanges } from '../../lib/ical';
import { SEASON_RATES, CLEANING_FEE } from '../../config/pricing';

export const GET: APIRoute = async ({ url }) => {
  try {
    const force = url.searchParams.get('refresh') === 'true';
    const unavailable = await getUnavailableDateRanges(force);
    const basePricePerNight = SEASON_RATES.low.directPricePerNight;
    const cleaningFee = CLEANING_FEE;
    const minStay = Number(process.env.MINIMUM_STAY_NIGHTS) || 2;

    return new Response(
      JSON.stringify({
        success: true,
        property: 'Apartamento Costa del Sol Suances',
        pricePerNight: basePricePerNight,
        cleaningFee,
        seasonalRates: SEASON_RATES,
        minStay,
        totalBlockedPeriods: unavailable.length,
        unavailable,
      }, null, 2),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching availability:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'No se pudo obtener la disponibilidad del calendario',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  }
};
