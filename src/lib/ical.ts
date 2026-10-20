import ical from 'node-ical';

export interface DateRange {
  start: string; // 'YYYY-MM-DD'
  end: string;   // 'YYYY-MM-DD'
  source: string; // 'booking' | 'airbnb' | 'direct' | 'booking, airbnb', etc.
  summary?: string;
}

export interface DirectReservation {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string; // 'YYYY-MM-DD'
  checkOut: string; // 'YYYY-MM-DD'
  guests: number;
  totalPrice: number;
  paymentMethod: 'stripe' | 'transfer_manual';
  status: 'confirmed' | 'pending_2h_transfer' | 'cancelled';
  createdAt: string;
  expiresAt?: string;
}

// Almacén en memoria de reservas directas locales (se sincronizan a los canales vía /api/calendar.ics)
export const directReservations: DirectReservation[] = [];

export function getDirectReservations(): DirectReservation[] {
  const now = Date.now();
  return directReservations.filter((res) => {
    if (res.status === 'confirmed') return true;
    if (res.status === 'pending_2h_transfer' && res.expiresAt) {
      return new Date(res.expiresAt).getTime() > now;
    }
    return false;
  });
}

export function addDirectReservation(res: DirectReservation): void {
  directReservations.push(res);
}

// Función para formatear Date a 'YYYY-MM-DD' respetando la fecha del calendario
export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Descarga y procesa un feed iCal externo con tolerancia a fallos
async function fetchAndParseIcalFeed(url: string, source: 'booking' | 'airbnb'): Promise<DateRange[]> {
  if (!url || !url.startsWith('http')) {
    return [];
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CostaDelSolSuances-CalendarSync/1.0',
        'Accept': 'text/calendar, text/plain, */*',
        'Cache-Control': 'no-cache',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[iCal Sync] Fallo al descargar feed ${source} (${response.status} ${response.statusText})`);
      return [];
    }

    const icsData = await response.text();
    const parsedData = await ical.async.parseICS(icsData);
    const ranges: DateRange[] = [];

    for (const key of Object.keys(parsedData)) {
      const item = parsedData[key];
      if (item.type === 'VEVENT' && item.start && item.end) {
        const start = new Date(item.start);
        const end = new Date(item.end);

        ranges.push({
          start: formatDateISO(start),
          end: formatDateISO(end),
          source,
          summary: item.summary ? String(item.summary).trim() : `Ocupado (${source.toUpperCase()})`,
        });
      }
    }

    return ranges;
  } catch (error) {
    console.error(`[iCal Sync] Error al procesar feed ${source}:`, error);
    return [];
  }
}

// Algoritmo de fusión y deduplicación de rangos de fechas solapados o consecutivos
export function mergeDateRanges(ranges: DateRange[]): DateRange[] {
  if (ranges.length === 0) return [];

  // Ordenar cronológicamente por fecha de inicio
  const sorted = [...ranges].sort((a, b) => a.start.localeCompare(b.start));
  const merged: DateRange[] = [];

  let current = {
    start: sorted[0].start,
    end: sorted[0].end,
    sources: new Set<string>([sorted[0].source]),
    summaries: sorted[0].summary ? [sorted[0].summary] : [],
  };

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];

    // Si hay solapamiento o continuidad directa (next.start <= current.end)
    if (next.start <= current.end) {
      if (next.end > current.end) {
        current.end = next.end;
      }
      current.sources.add(next.source);
      if (next.summary && !current.summaries.includes(next.summary)) {
        current.summaries.push(next.summary);
      }
    } else {
      merged.push({
        start: current.start,
        end: current.end,
        source: Array.from(current.sources).join(', '),
        summary: current.summaries.join(' | '),
      });
      current = {
        start: next.start,
        end: next.end,
        sources: new Set<string>([next.source]),
        summaries: next.summary ? [next.summary] : [],
      };
    }
  }

  merged.push({
    start: current.start,
    end: current.end,
    source: Array.from(current.sources).join(', '),
    summary: current.summaries.join(' | '),
  });

  return merged;
}

// Cache en memoria breve (60 segundos) para no saturar las llamadas externas en tráfico concurrente
let cachedResult: { timestamp: number; ranges: DateRange[] } | null = null;
const CACHE_TTL_MS = 60 * 1000;

// Obtiene todas las fechas no disponibles combinando Booking.com + Airbnb + Reservas Directas fusionadas
export async function getUnavailableDateRanges(forceRefresh = false): Promise<DateRange[]> {
  const now = Date.now();
  if (!forceRefresh && cachedResult && now - cachedResult.timestamp < CACHE_TTL_MS) {
    return cachedResult.ranges;
  }

  const bookingUrl = process.env.BOOKING_ICAL_URL || "https://ical.booking.com/v1/export?t=b6eaf790-2685-469b-983a-a237337dc1f2";
  const airbnbUrl = process.env.AIRBNB_ICAL_URL || "https://www.airbnb.es/calendar/ical/688729813253169686.ics?t=4ba17b419fd54c2dac2a4b1213f47819";

  // Descarga y procesamiento concurrente en paralelo
  const [bookingRanges, airbnbRanges] = await Promise.all([
    fetchAndParseIcalFeed(bookingUrl, 'booking'),
    fetchAndParseIcalFeed(airbnbUrl, 'airbnb'),
  ]);

  // Fechas bloqueadas desde reservas directas locales
  const directRanges: DateRange[] = getDirectReservations().map((res) => ({
    start: res.checkIn,
    end: res.checkOut,
    source: 'direct',
    summary: `Reserva Directa #${res.id}`,
  }));

  const combined = [...bookingRanges, ...airbnbRanges, ...directRanges];
  const merged = mergeDateRanges(combined);

  cachedResult = {
    timestamp: now,
    ranges: merged,
  };

  return merged;
}

// Comprueba si un rango de fechas solicitado está completamente libre
export function isRangeAvailable(checkInStr: string, checkOutStr: string, unavailable: DateRange[]): boolean {
  const reqStart = new Date(checkInStr).getTime();
  const reqEnd = new Date(checkOutStr).getTime();

  if (isNaN(reqStart) || isNaN(reqEnd) || reqEnd <= reqStart) {
    return false;
  }

  for (const block of unavailable) {
    const blockStart = new Date(block.start).getTime();
    const blockEnd = new Date(block.end).getTime();

    // Comprobación de solapamiento
    if (reqStart < blockEnd && reqEnd > blockStart) {
      return false;
    }
  }

  return true;
}

// Genera un archivo iCalendar (.ics estándar RFC 5545) para exportar hacia Booking y Airbnb
export function generateIcsCalendar(reservations: DirectReservation[]): string {
  const now = new Date();
  const dtstamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Apartamento Costa del Sol Suances//Reservas Directas 1.0//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Costa del Sol Suances - Reservas Directas',
    'X-WR-TIMEZONE:Europe/Madrid',
  ];

  for (const res of reservations) {
    const startCompact = res.checkIn.replace(/-/g, '');
    const endCompact = res.checkOut.replace(/-/g, '');
    const uid = `${res.id}@costadelsolsuances.es`;

    icsContent.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${startCompact}`,
      `DTEND;VALUE=DATE:${endCompact}`,
      `SUMMARY:Reserva Directa - ${res.guestName.split(' ')[0]}`,
      `DESCRIPTION:Reserva confirmada en web oficial (#${res.id}) para ${res.guests} personas.`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  }

  icsContent.push('END:VCALENDAR');
  return icsContent.join('\r\n');
}
