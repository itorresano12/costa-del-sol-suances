export const prerender = false;

import type { APIRoute } from 'astro';
import { generateIcsCalendar, getDirectReservations } from '../../lib/ical';

export const GET: APIRoute = async () => {
  try {
    const directRes = getDirectReservations();
    const icsString = generateIcsCalendar(directRes);

    return new Response(icsString, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="costa-del-sol-suances.ics"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating calendar.ics:', error);
    return new Response('Error generando archivo iCal', { status: 500 });
  }
};
