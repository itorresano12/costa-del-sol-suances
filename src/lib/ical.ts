import ical from 'node-ical';

export interface DateRange {
  start: string; // 'YYYY-MM-DD'
  end: string;   // 'YYYY-MM-DD'
  source: 'booking' | 'airbnb' | 'direct' | 'blocked';
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
export const directReservations: DirectReservation[] = [
  {
    id: 'CDS-DEMO-01',
    guestName: 'Marta Gómez',
    guestEmail: 'marta.gomez@example.com',
    guestPhone: '+34 611 223 344',
    checkIn: '2026-11-12',
    checkOut: '2026-11-16',
    guests: 4,
    totalPrice: 480,
    paymentMethod: 'stripe',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'CDS-DEMO-02',
    guestName: 'Carlos Santillana',
    guestEmail: 'carlos.s@example.com',
    guestPhone: '+34 655 443 322',
    checkIn: '2026-12-04',
    checkOut: '2026-12-08',
    guests: 2,
    totalPrice: 480,
    paymentMethod: 'transfer_manual',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  }
];

export function getDirectReservations(): DirectReservation[] {
  // Filtrar reservas que sigan activas (confirmadas o pendientes dentro de su ventana de 2h)
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

// Función auxiliar para formatear Date a 'YYYY-MM-DD'
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
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CostaDelSolSuances-CalendarSync/1.0',
        'Accept': 'text/calendar, text/plain, */*',
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
          summary: item.summary ? String(item.summary) : `Ocupado (${source.toUpperCase()})`,
        });
      }
    }

    return ranges;
  } catch (error) {
    console.error(`[iCal Sync] Error al procesar feed ${source}:`, error);
    return [];
  }
}

// Obtiene todas las fechas no disponibles combinando Booking.com + Airbnb + Reservas Directas
export async function getUnavailableDateRanges(): Promise<DateRange[]> {
  const bookingUrl = process.env.BOOKING_ICAL_URL || '';
  const airbnbUrl = process.env.AIRBNB_ICAL_URL || '';

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

  return [...bookingRanges, ...airbnbRanges, ...directRanges];
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

    // Comprobación de solapamiento de fechas
    // Entrada o estancia coincide con el bloqueo
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
    // Formato fecha iCal: YYYYMMDD
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

