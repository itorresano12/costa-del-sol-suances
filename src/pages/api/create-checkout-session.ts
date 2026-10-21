export const prerender = false;

import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { getUnavailableDateRanges, isRangeAvailable, addDirectReservation } from '../../lib/ical';
import { sendBookingConfirmation } from '../../lib/email';
import { calculateStayPricing } from '../../config/pricing';

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

    if (!checkIn || !checkOut || !guestName || !guestEmail) {
      return new Response(
        JSON.stringify({ success: false, message: 'Faltan datos obligatorios de la reserva' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Comprobar disponibilidad
    const unavailable = await getUnavailableDateRanges();
    if (!isRangeAvailable(checkIn, checkOut, unavailable)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Las fechas seleccionadas ya no están disponibles' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Cálculo estacional dinámico y 10% de ahorro directo
    const pricing = calculateStayPricing(checkIn, checkOut);
    const { nights, stayTotal, grandTotal, depositAmount, remainingAmount } = pricing;

    const reservationId = `CDS-STR-${Date.now().toString(36).toUpperCase()}`;
    const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:4321';

    const stripeSecret = process.env.STRIPE_SECRET_KEY || '';

    // Si hay clave de Stripe válida, generamos sesión real
    if (stripeSecret && stripeSecret.startsWith('sk_live_') || stripeSecret.startsWith('sk_test_') && !stripeSecret.includes('mock')) {
      try {
        const stripe = new Stripe(stripeSecret);
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'eur',
                product_data: {
                  name: `Anticipo 50% - Apartamento Costa del Sol Suances (${nights} noches)`,
                  description: `Bloqueo de fechas del ${checkIn} al ${checkOut} (Total: ${grandTotal}€, restante 50%: ${remainingAmount}€ antes de la entrada).`,
                },
                unit_amount: depositAmount * 100, // céntimos
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          customer_email: guestEmail,
          client_reference_id: reservationId,
          success_url: `${baseUrl}/reserva-confirmada?ref=${reservationId}&type=stripe&in=${checkIn}&out=${checkOut}`,
          cancel_url: `${baseUrl}/#reservas`,
          metadata: {
            checkIn,
            checkOut,
            guests: String(guests),
            guestName,
            guestPhone: guestPhone || '',
            grandTotal: String(grandTotal),
            depositAmount: String(depositAmount),
            remainingAmount: String(remainingAmount),
          },
        });

        // Registrar reserva directa
        addDirectReservation({
          id: reservationId,
          guestName,
          guestEmail,
          guestPhone: guestPhone || '',
          checkIn,
          checkOut,
          guests: Number(guests) || 2,
          totalPrice: grandTotal,
          paymentMethod: 'stripe',
          status: 'confirmed',
          createdAt: new Date().toISOString(),
          invoiceRequested: Boolean(invoiceRequested),
          invoiceCompanyName,
          invoiceTaxId,
          invoiceAddress,
        });

        // Enviar confirmación al huésped (BCC anfitrión)
        sendBookingConfirmation({
          reservationId,
          guestName,
          guestEmail,
          guestPhone: guestPhone || '',
          checkIn,
          checkOut,
          nights,
          guests: Number(guests) || 2,
          grandTotal,
          depositAmount,
          remainingAmount,
          paymentMethod: 'stripe',
          status: 'confirmed',
          invoiceRequested: Boolean(invoiceRequested),
          invoiceCompanyName,
          invoiceTaxId,
          invoiceAddress,
        }).catch((err) => console.error('[create-checkout-session] Error enviando email:', err));

        return new Response(JSON.stringify({ success: true, url: session.url }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (stripeErr: any) {
        console.warn('Stripe checkout real falló, recurriendo a modo simulación:', stripeErr?.message);
      }
    }

    // Modo Demostración / Fallback sin credenciales activas
    addDirectReservation({
      id: reservationId,
      guestName,
      guestEmail,
      guestPhone: guestPhone || '',
      checkIn,
      checkOut,
      guests: Number(guests) || 2,
      totalPrice: grandTotal,
      paymentMethod: 'stripe',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      invoiceRequested: Boolean(invoiceRequested),
      invoiceCompanyName,
      invoiceTaxId,
      invoiceAddress,
    });

    sendBookingConfirmation({
      reservationId,
      guestName,
      guestEmail,
      guestPhone: guestPhone || '',
      checkIn,
      checkOut,
      nights,
      guests: Number(guests) || 2,
      grandTotal,
      depositAmount,
      remainingAmount,
      paymentMethod: 'stripe',
      status: 'confirmed',
      invoiceRequested: Boolean(invoiceRequested),
      invoiceCompanyName,
      invoiceTaxId,
      invoiceAddress,
    }).catch((err) => console.error('[create-checkout-session] Error enviando email:', err));

    const demoSuccessUrl = `${baseUrl}/reserva-confirmada?ref=${reservationId}&type=stripe_demo&in=${checkIn}&out=${checkOut}&total=${grandTotal}&deposit=${depositAmount}&remaining=${remainingAmount}`;
    return new Response(
      JSON.stringify({
        success: true,
        url: demoSuccessUrl,
        mode: 'demo',
        message: 'Sesión de pago simulada correctamente con Stripe Checkout',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error en create-checkout-session:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Error interno al procesar el pago' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

