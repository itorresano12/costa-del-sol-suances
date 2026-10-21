export const prerender = false;

import type { APIRoute } from 'astro';
import { getUnavailableDateRanges, isRangeAvailable, addDirectReservation } from '../../lib/ical';
import { sendBookingConfirmation } from '../../lib/email';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { 
      checkIn, 
      checkOut, 
      guests, 
      guestName, 
      guestEmail, 
      guestPhone, 
      notes,
      invoiceRequested,
      invoiceCompanyName,
      invoiceTaxId,
      invoiceAddress
    } = data;

    if (!checkIn || !checkOut || !guestName || !guestEmail || !guestPhone) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Por favor, completa nombre, email y teléfono para bloquear tus fechas.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar disponibilidad
    const unavailable = await getUnavailableDateRanges();
    if (!isRangeAvailable(checkIn, checkOut, unavailable)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Lo sentimos, las fechas seleccionadas ya no están disponibles en el calendario.',
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const pricePerNight = Number(process.env.DEFAULT_PRICE_PER_NIGHT) || 110;
    const cleaningFee = Number(process.env.CLEANING_FEE) || 40;
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const nights = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const stayTotal = nights * pricePerNight;
    const grandTotal = stayTotal + cleaningFee;
    const depositAmount = Math.round(grandTotal * 0.5);
    const remainingAmount = grandTotal - depositAmount;

    // Bloqueo temporal de 2 horas (120 minutos)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
    const reservationId = `CDS-MAN-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Registrar en reservas directas con estatus de pre-reserva temporal
    addDirectReservation({
      id: reservationId,
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      guests: Number(guests) || 2,
      totalPrice: grandTotal,
      paymentMethod: 'transfer_manual',
      status: 'pending_2h_transfer',
      createdAt: now.toISOString(),
      expiresAt,
      invoiceRequested: Boolean(invoiceRequested),
      invoiceCompanyName,
      invoiceTaxId,
      invoiceAddress,
    });

    const paymentDetails = {
      bizumPhone: process.env.PAYMENT_BIZUM_PHONE || '+34 600 000 000',
      bankIban: process.env.PAYMENT_BANK_IBAN || 'ES91 2100 0418 4502 0005 1332',
      bankBeneficiary: process.env.PAYMENT_BANK_BENEFICIARY || 'Ivan Torresano - Apartamento Costa del Sol Suances',
      concept: `Reserva ${reservationId} - ${guestName.split(' ')[0]}`,
    };

    // Disparar envío o simulación de correo de confirmación al huésped (BCC al anfitrión)
    sendBookingConfirmation({
      reservationId,
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      nights,
      guests: Number(guests) || 2,
      grandTotal,
      depositAmount,
      remainingAmount,
      paymentMethod: 'transfer_manual',
      status: 'pending_2h_transfer',
      expiresAt,
      bankDetails: paymentDetails,
      invoiceRequested: Boolean(invoiceRequested),
      invoiceCompanyName,
      invoiceTaxId,
      invoiceAddress,
    }).catch((err) => console.error('[manual-booking] Error enviando email de confirmación:', err));

    return new Response(
      JSON.stringify({
        success: true,
        reservationId,
        guestName,
        checkIn,
        checkOut,
        nights,
        guests,
        grandTotal,
        depositAmount,
        remainingAmount,
        expiresAt,
        paymentDetails,
        message: '¡Fechas bloqueadas con éxito durante 2 horas!',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error en manual-booking:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Error interno al procesar la pre-reserva' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

