export const prerender = false;

import type { APIRoute } from 'astro';
import { confirmDirectReservation, getDirectReservationById } from '../../lib/ical';
import { verifyConfirmToken } from '../../lib/email';
import { SITE_CONFIG } from '../../config/site';

export const GET: APIRoute = async ({ url }) => {
  const id = url.searchParams.get('id');
  const token = url.searchParams.get('token');

  if (!id || !token || !verifyConfirmToken(id, token)) {
    return new Response(
      `<!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8">
        <title>Enlace no válido - Costa del Sol Suances</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, sans-serif; background: #FDFBF7; color: #1c1917; padding: 40px 20px; text-align: center; }
          .card { max-width: 480px; margin: 0 auto; background: white; padding: 32px; border-radius: 20px; border: 1px solid #e7e5e4; }
          h1 { color: #dc2626; font-size: 20px; margin-bottom: 12px; }
          p { color: #666; font-size: 14px; line-height: 1.5; }
          a { display: inline-block; margin-top: 20px; color: #0f172a; font-weight: 600; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>⚠️ Enlace de confirmación no válido o caducado</h1>
          <p>No se ha podido autenticar la solicitud de confirmación para el identificador proporcionado.</p>
          <a href="/">← Volver al sitio web principal</a>
        </div>
      </body>
      </html>`,
      { status: 403, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  // Confirmar reserva en el almacén iCal
  const reservation = confirmDirectReservation(id) || getDirectReservationById(id);

  return new Response(
    `<!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8">
      <title>✓ Pago Confirmado - Calendario Blindado</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #FDFBF7; color: #1c1917; margin: 0; padding: 40px 20px; }
        .wrapper { max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e7e5e4; border-radius: 24px; padding: 36px 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); text-align: center; }
        .logo-pre { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #64748b; font-weight: 600; margin: 0; }
        .logo-title { font-family: Georgia, serif; font-size: 22px; color: #0f172a; margin: 4px 0 24px 0; font-weight: 400; letter-spacing: 2px; }
        .badge-check { width: 64px; height: 64px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #059669; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; font-size: 28px; }
        h1 { font-family: Georgia, serif; font-size: 22px; color: #0f172a; margin: 0 0 12px 0; font-weight: normal; }
        p { font-size: 14px; color: #57534e; line-height: 1.6; margin: 0 0 24px 0; }
        .details-box { background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 16px; padding: 18px 20px; text-align: left; font-size: 13px; margin-bottom: 24px; }
        .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f0eee9; }
        .row:last-child { border-bottom: none; font-weight: 700; color: #059669; }
        .btn { display: block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 14px; border-radius: 12px; font-weight: 600; font-size: 14px; margin-bottom: 10px; }
        .btn-feed { display: block; background: #f1f5f9; color: #334155; text-decoration: none; padding: 12px; border-radius: 12px; font-weight: 500; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <p class="logo-pre">Apartamento Turístico</p>
        <h2 class="logo-title">COSTA DEL SOL SUANCES</h2>

        <div class="badge-check">✓</div>

        <h1>¡Pago Recibido y Fechas Blindadas!</h1>
        <p>
          La pre-reserva ha pasado a estado <strong>CONFIRMADA DEFINITIVA</strong>. El temporizador de 2 horas se ha desactivado y las fechas están bloqueadas permanentemente en Airbnb y Booking a través del feed iCal.
        </p>

        <div class="details-box">
          <div class="row">
            <span style="color:#78716c;">Localizador:</span>
            <strong>${id}</strong>
          </div>
          ${
            reservation
              ? `
          <div class="row">
            <span style="color:#78716c;">Huésped:</span>
            <span>${reservation.guestName}</span>
          </div>
          <div class="row">
            <span style="color:#78716c;">Fechas:</span>
            <span>${reservation.checkIn} → ${reservation.checkOut}</span>
          </div>
          <div class="row">
            <span style="color:#78716c;">Importe Total:</span>
            <span>${reservation.totalPrice} €</span>
          </div>
          `
              : ''
          }
          <div class="row">
            <span style="color:#78716c;">Estado de Calendario:</span>
            <span>✓ Bloqueado en Booking & Airbnb</span>
          </div>
        </div>

        <a href="/" class="btn">Ir a la Web Principal</a>
        <a href="/api/calendar.ics" target="_blank" class="btn-feed">Ver Feed iCal Activo (/api/calendar.ics)</a>
      </div>
    </body>
    </html>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }
  );
};
