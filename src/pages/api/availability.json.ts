export const prerender = false;

import type { APIRoute } from 'astro';
import { getUnavailableDateRanges } from '../../lib/ical';

export const GET: APIRoute = async ({ url }) => {
  try {
    const force = url.searchParams.get('refresh') === 'true';
    const unavailable = await getUnavailableDateRanges(force);
    const pricePerNight = Number(process.env.DEFAULT_PRICE_PER_NIGHT) || 110;
    const cleaningFee = Number(process.env.CLEANING_FEE) || 40;
    const minStay = Number(process.env.MINIMUM_STAY_NIGHTS) || 2;

    return new Response(
      JSON.stringify({
        success: true,
        property: 'Apartamento Costa del Sol Suances',
        pricePerNight,
        cleaningFee,
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
