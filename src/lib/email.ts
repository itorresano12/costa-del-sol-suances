import { SITE_CONFIG } from '../config/site';

export interface BookingEmailData {
  reservationId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  grandTotal: number;
  depositAmount?: number;
  remainingAmount?: number;
  paymentMethod: 'stripe' | 'transfer_manual' | 'bizum';
  status: string;
  expiresAt?: string;
  bankDetails?: {
    bizumPhone: string;
    bankIban: string;
    bankBeneficiary: string;
    concept: string;
  };
  invoiceRequested?: boolean;
  invoiceCompanyName?: string;
  invoiceTaxId?: string;
  invoiceAddress?: string;
}

/**
 * Genera la plantilla HTML responsive boutique para el correo de confirmación de reserva
 */
export function generateBookingEmailHtml(data: BookingEmailData): string {
  const baseUrl = process.env.PUBLIC_BASE_URL || 'https://costa-del-sol-suances.vercel.app';
  const guidePageUrl = `${baseUrl}/guia-huespedes`;
  const isTransfer = data.paymentMethod === 'transfer_manual' || data.paymentMethod === 'bizum';
  const firstName = data.guestName.split(' ')[0] || data.guestName;
  const deposit = data.depositAmount || Math.round(data.grandTotal * 0.5);
  const remaining = data.remainingAmount || (data.grandTotal - deposit);

  const paymentProofWhatsapp = `https://wa.me/${SITE_CONFIG.whatsappPhone}?text=${encodeURIComponent(
    `Hola Iván, te adjunto el comprobante de pago del anticipo de mi reserva ${data.reservationId} (${deposit}€) en Apartamento Costa del Sol Suances (${data.checkIn} al ${data.checkOut}).`
  )}`;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Reserva - Apartamento Costa del Sol Suances</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #1c1917;
      background-color: #FDFBF7;
      margin: 0;
      padding: 0;
    }
    .wrapper {
      max-width: 620px;
      margin: 24px auto;
      background: #ffffff;
      border: 1px solid #e7e5e4;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.06);
    }
    .header {
      background-color: #0F172A;
      padding: 38px 24px;
      text-align: center;
    }
    .header-logo {
      margin: 0;
      font-family: Georgia, serif;
      font-size: 21px;
      letter-spacing: 4px;
      color: #FFFFFF;
      font-weight: 400;
      text-transform: uppercase;
    }
    .header-subtitle {
      margin: 6px 0 0 0;
      font-size: 10px;
      letter-spacing: 3px;
      color: #94A3B8;
      text-transform: uppercase;
      font-weight: 600;
    }
    .content {
      padding: 36px 32px;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 16px;
      background-color: ${isTransfer ? '#fef3c7' : '#ecfdf5'};
      color: ${isTransfer ? '#92400e' : '#065f46'};
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 24px;
      letter-spacing: 0.3px;
    }
    .greeting {
      font-family: Georgia, serif;
      font-size: 22px;
      color: #0f172a;
      line-height: 1.35;
      margin: 0 0 16px 0;
      font-weight: normal;
    }
    .lead-text {
      font-size: 15px;
      color: #44403c;
      margin-bottom: 24px;
      line-height: 1.6;
    }
    .table-container {
      background-color: #fafaf9;
      border: 1px solid #e7e5e4;
      border-radius: 14px;
      overflow: hidden;
      margin-bottom: 24px;
    }
    .table-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 18px;
      border-bottom: 1px solid #f0eee9;
      font-size: 14px;
    }
    .table-row:last-child {
      border-bottom: none;
      background-color: #f5f5f4;
      font-weight: 700;
      color: #0f172a;
      font-size: 15px;
    }
    .table-label {
      color: #78716c;
      font-weight: 500;
    }
    .table-value {
      color: #1c1917;
      text-align: right;
    }
    .policy-box {
      background: #f8fafc;
      border-left: 4px solid #0f172a;
      padding: 14px 18px;
      border-radius: 6px;
      font-size: 13px;
      color: #334155;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .payment-box {
      background-color: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 14px;
      padding: 20px;
      margin-bottom: 24px;
      font-size: 13px;
    }
    .payment-box h4 {
      margin: 0 0 10px 0;
      color: #92400e;
      font-size: 14px;
      font-weight: 700;
    }
    .invoice-box {
      background-color: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 12px;
      padding: 18px;
      margin-bottom: 24px;
      font-size: 13px;
      color: #334155;
    }
    .cta-guide-button {
      display: block;
      background-color: #0f172a;
      color: #ffffff !important;
      text-align: center;
      padding: 16px 24px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      text-decoration: none;
      margin: 28px 0 14px 0;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.2);
    }
    .whatsapp-button {
      display: block;
      background-color: #25D366;
      color: #ffffff !important;
      text-align: center;
      padding: 13px 20px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      margin-bottom: 24px;
    }
    .footer {
      background-color: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <!-- Header Editorial -->
    <div class="header">
      <h1 class="header-logo">COSTA DEL SOL</h1>
      <p class="header-subtitle">SUANCES · CANTABRIA</p>
    </div>

    <!-- Content -->
    <div class="content">
      <div style="text-align: center;">
        <span class="status-badge">
          ${isTransfer ? '⏳ Pre-reserva Temporal (Bloqueo 2 Horas)' : '✓ Reserva Directa Confirmada'}
        </span>
      </div>

      <h2 class="greeting">
        ¡Hola ${firstName}! Tu refugio junto a la Playa de La Concha está reservado
      </h2>

      <p class="lead-text">
        ${
          isTransfer
            ? 'Hemos bloqueado de forma exclusiva las fechas en nuestro calendario durante <strong>120 minutos</strong> para garantizarte la tarifa directa más ventajosa sin recargos de agencias externas.'
            : 'Tu reserva directa está 100% asegurada. Todo el equipo está preparando el apartamento para que disfrutes de unos días inolvidables frente al mar Cantábrico.'
        }
      </p>

      <!-- Tabla de Resumen Completo -->
      <div class="table-container">
        <div class="table-row">
          <span class="table-label">Localizador de Reserva:</span>
          <span class="table-value"><strong>${data.reservationId}</strong></span>
        </div>
        <div class="table-row">
          <span class="table-label">Entrada (Check-in):</span>
          <span class="table-value">${data.checkIn} (a partir de las 16:00 h)</span>
        </div>
        <div class="table-row">
          <span class="table-label">Salida (Check-out):</span>
          <span class="table-value">${data.checkOut} (hasta las 11:00 h)</span>
        </div>
        <div class="table-row">
          <span class="table-label">Estancia y Capacidad:</span>
          <span class="table-value">${data.nights} noche${data.nights > 1 ? 's' : ''} · ${data.guests} huéspedes</span>
        </div>
        <div class="table-row">
          <span class="table-label">Política Pet-Friendly:</span>
          <span class="table-value">🐾 Mascotas bienvenidas (0 € suplemento)</span>
        </div>
        <div class="table-row">
          <span class="table-label">Modalidad de Pago:</span>
          <span class="table-value">${isTransfer ? 'Transferencia / Bizum manual' : 'Tarjeta de Crédito / Bizum Stripe'}</span>
        </div>
        <div class="table-row">
          <span class="table-label">Total Estancia:</span>
          <span class="table-value">${data.grandTotal} € (IVA y limpieza inc.)</span>
        </div>
        <div class="table-row" style="background-color: #f0fdf4;">
          <span class="table-label" style="color: #166534; font-weight: 600;">Pago hoy (Anticipo 50% para bloqueo de fechas):</span>
          <span class="table-value" style="color: #166534;"><strong>${deposit} €</strong> ${isTransfer ? '(Pendiente justificante)' : '(Abonado)'}</span>
        </div>
        <div class="table-row">
          <span class="table-label">Importe restante (50%):</span>
          <span class="table-value">${remaining} € (a abonar antes de la entrada al alojamiento)</span>
        </div>
      </div>

      <!-- Recordatorio de Cancelación -->
      <div class="policy-box">
        <strong>🛡️ Política de Cancelación (14 días):</strong> Cancelación gratuita con reembolso íntegro hasta <strong>14 días antes</strong> de tu fecha de llegada. Si la cancelación se produce con menos de 14 días de antelación o en caso de no presentación, el anticipo de la reserva (50%) no será reembolsable como compensación por el bloqueo de fechas en el calendario.
      </div>

      ${
        isTransfer && data.bankDetails
          ? `
      <!-- Instrucciones de Pago Vía B -->
      <div class="payment-box">
        <h4>💳 Instrucciones para completar el pago del anticipo (Bizum o Transferencia):</h4>
        <p style="margin: 4px 0;">💰 <strong>Importe a transferir hoy (50% anticipo):</strong> <span style="font-size: 15px; font-weight: 700; color: #92400e;">${deposit} €</span></p>
        <p style="margin: 4px 0;">📱 <strong>Teléfono Bizum:</strong> ${data.bankDetails.bizumPhone}</p>
        <p style="margin: 4px 0;">🏦 <strong>IBAN Transferencia:</strong> ${data.bankDetails.bankIban}</p>
        <p style="margin: 4px 0;">👤 <strong>Beneficiario:</strong> ${data.bankDetails.bankBeneficiary}</p>
        <p style="margin: 4px 0;">📝 <strong>Concepto a indicar:</strong> ${data.bankDetails.concept}</p>
        <p style="margin: 10px 0 0 0; color: #b45309; font-weight: 500;">
          Envíanos el justificante por WhatsApp antes del plazo de 2 horas para activar la confirmación definitiva.
        </p>
      </div>

      <a href="${paymentProofWhatsapp}" class="whatsapp-button" target="_blank">
        💬 Enviar Justificante de Pago por WhatsApp
      </a>
      `
          : ''
      }

      ${
        data.invoiceRequested
          ? `
      <!-- Datos de Factura Solicitada -->
      <div class="invoice-box">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 14px;">🧾 Factura Legal Solicitada (Empresa / Autónomo):</h4>
        <p style="margin: 3px 0;"><strong>Razón Social:</strong> ${data.invoiceCompanyName || data.guestName}</p>
        <p style="margin: 3px 0;"><strong>NIF / CIF:</strong> ${data.invoiceTaxId || 'Pendiente de confirmación'}</p>
        <p style="margin: 3px 0;"><strong>Dirección Fiscal:</strong> ${data.invoiceAddress || 'A enviar junto con el documento'}</p>
        <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b;">
          * La factura con desglose oficial de IVA será remitida a tu correo tras el check-in.
        </p>
      </div>
      `
          : ''
      }

      <!-- Botón Destacado: Guía Secreta Exclusiva -->
      <a href="${guidePageUrl}" class="cta-guide-button" target="_blank">
        📖 Descargar Guía Secreta de Suances & Cantabria (PDF)
      </a>

      <!-- Contacto Anfitrión WhatsApp -->
      <a href="${SITE_CONFIG.whatsappUrl}" class="whatsapp-button" target="_blank" style="background-color: #0F172A;">
        👋 Hablar directamente con Iván (Anfitrión) por WhatsApp
      </a>

      <p style="font-size: 13px; color: #78716c; line-height: 1.6; margin-top: 20px;">
        Si viajas con mascotas, requieres cuna de viaje o deseas que te reservemos clases de surf o mesa en marisquerías de confianza, escríbenos con antelación y lo coordinaremos contigo personalmente.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin: 0 0 6px 0; font-weight: 500; color: #64748b;">
        Apartamento Costa del Sol Suances · C/ Ceballos, Suances, Cantabria
      </p>
      <p style="margin: 0;">
        ${SITE_CONFIG.touristLicense} · Diseñado por ${SITE_CONFIG.designerName}
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Genera token de autenticación determinista para la confirmación de pagos del anfitrión
 */
export function generateConfirmToken(id: string): string {
  const secret = process.env.ADMIN_SECRET || 'cds_suances_secure_token_2026';
  let hash = 0;
  const str = `${id}:${secret}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function verifyConfirmToken(id: string, token: string): boolean {
  if (!id || !token) return false;
  return generateConfirmToken(id) === token;
}

/**
 * Genera la plantilla de notificación interna exclusiva para el anfitrión con botón de confirmación Bizum
 */
export function generateHostNotificationEmailHtml(data: BookingEmailData): string {
  const baseUrl = process.env.PUBLIC_BASE_URL || 'https://costa-del-sol-suances.vercel.app';
  const isTransfer = data.paymentMethod === 'transfer_manual' || data.paymentMethod === 'bizum';
  const deposit = data.depositAmount || Math.round(data.grandTotal * 0.5);
  const remaining = data.remainingAmount || (data.grandTotal - deposit);
  const confirmToken = generateConfirmToken(data.reservationId);
  const confirmUrl = `${baseUrl}/api/confirm-booking?id=${data.reservationId}&token=${confirmToken}`;

  const cleanPhone = (data.guestPhone || '').replace(/[^0-9]/g, '');
  const whatsappGuestUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hola ${data.guestName}, te contacto desde Apartamento Costa del Sol Suances con relación a tu reserva ${data.reservationId}.`
  )}`;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Notificación Anfitrión - Costa del Sol Suances</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #FDFBF7; color: #1c1917; margin: 0; padding: 20px; }
    .box { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e7e5e4; padding: 28px; }
    .btn-confirm { display: block; background: #059669; color: #ffffff !important; font-weight: 700; text-align: center; padding: 16px 20px; border-radius: 12px; font-size: 15px; text-decoration: none; margin: 24px 0; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25); }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0eee9; font-size: 14px; }
  </style>
</head>
<body>
  <div class="box">
    <div style="background: #0f172a; color: white; padding: 16px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
      <h3 style="margin: 0; font-size: 16px; font-weight: 600; letter-spacing: 1px;">PANEL DE NOTIFICACIÓN DEL ANFITRIÓN</h3>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">Apartamento Costa del Sol Suances</p>
    </div>

    <p style="font-size: 15px;">
      Has recibido una nueva <strong>${isTransfer ? 'Pre-Reserva por Bizum / Transferencia' : 'Reserva Online confirmada'}</strong>:
    </p>

    <div style="background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
      <div class="row"><span>Localizador:</span><strong>${data.reservationId}</strong></div>
      <div class="row"><span>Huésped:</span><strong>${data.guestName}</strong></div>
      <div class="row"><span>Teléfono:</span><a href="${whatsappGuestUrl}" target="_blank" style="color: #059669; font-weight: 600;">${data.guestPhone} (WhatsApp)</a></div>
      <div class="row"><span>Email:</span><a href="mailto:${data.guestEmail}" style="color: #0f172a;">${data.guestEmail}</a></div>
      <div class="row"><span>Fechas:</span><span>${data.checkIn} → ${data.checkOut} (${data.nights} noches)</span></div>
      <div class="row"><span>Huéspedes:</span><span>${data.guests} personas</span></div>
      <div class="row"><span>Total Estancia:</span><strong>${data.grandTotal} €</strong></div>
      <div class="row" style="background:#f0fdf4; color:#166534; font-weight:bold;"><span>Anticipo 50%:</span><span>${deposit} €</span></div>
      <div class="row"><span>Restante 50% entrada:</span><span>${remaining} €</span></div>
      ${
        data.invoiceRequested
          ? `
      <div class="row" style="color:#b45309; font-weight:500;">
        <span>Factura Solicitada:</span>
        <span>${data.invoiceCompanyName} (NIF: ${data.invoiceTaxId || 'N/A'}) - ${data.invoiceAddress || 'N/A'}</span>
      </div>
      `
          : ''
      }
    </div>

    ${
      isTransfer
        ? `
    <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; font-size: 13px; color: #92400e; line-height: 1.5;">
      ⚠️ <strong>Bloqueo Temporal de 2 horas activo:</strong> Las fechas están reservadas temporalmente. Cuando compruebes la recepción del Bizum o transferencia de <strong>${deposit} €</strong> en tu cuenta, pulsa este botón para confirmar definitivamente el bloqueo en los calendarios de Booking y Airbnb:
    </div>

    <a href="${confirmUrl}" class="btn-confirm" target="_blank">
      ✓ Confirmar Pago Recibido (Bloqueo Definitivo en Calendarios)
    </a>
    `
        : `
    <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 14px; font-size: 13px; color: #065f46;">
      ✓ Pago procesado automáticamente por Stripe Checkout. Fechas blindadas en iCal.
    </div>
    `
    }

    <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e7e5e4;">
      <a href="${whatsappGuestUrl}" target="_blank" style="color: #0f172a; font-size: 13px; font-weight: 600; text-decoration: underline;">
        💬 Contactar con ${data.guestName} por WhatsApp
      </a>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Envía la notificación de reserva al huésped con copia y panel de control para el anfitrión
 */
export async function sendBookingConfirmation(data: BookingEmailData): Promise<{
  success: boolean;
  mock?: boolean;
  id?: string;
  error?: string;
}> {
  const hostEmail = process.env.HOST_EMAIL || SITE_CONFIG.hostEmail;
  const resendApiKey = process.env.RESEND_API_KEY;
  const guestHtml = generateBookingEmailHtml(data);
  const hostHtml = generateHostNotificationEmailHtml(data);
  const isTransfer = data.paymentMethod === 'transfer_manual' || data.paymentMethod === 'bizum';
  const guestSubject = isTransfer
    ? `⏳ Pre-Reserva Recibida [${data.reservationId}] - Apartamento Costa del Sol Suances`
    : `✓ Confirmación de Reserva [${data.reservationId}] - Apartamento Costa del Sol Suances`;
  const hostSubject = `🔔 [${isTransfer ? 'Bizum Pendiente' : 'Stripe Confirmado'}] Reserva ${data.reservationId} - ${data.guestName}`;

  const confirmToken = generateConfirmToken(data.reservationId);
  const baseUrl = process.env.PUBLIC_BASE_URL || 'https://costa-del-sol-suances.vercel.app';
  const hostConfirmUrl = `${baseUrl}/api/confirm-booking?id=${data.reservationId}&token=${confirmToken}`;

  // Envío real si existe API Key de Resend
  if (resendApiKey) {
    try {
      // 1. Envío al huésped
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Costa del Sol Suances <reservas@costadelsolsuances.es>',
          to: [data.guestEmail],
          reply_to: hostEmail,
          subject: guestSubject,
          html: guestHtml,
        }),
      });

      // 2. Envío al anfitrión con el botón de confirmación de Bizum
      const hostRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Costa del Sol Suances <reservas@costadelsolsuances.es>',
          to: [hostEmail],
          subject: hostSubject,
          html: hostHtml,
        }),
      });

      const resData = await hostRes.json();
      console.log(`[Email] Notificaciones enviadas vía Resend a ${data.guestEmail} y anfitrión (${hostEmail})`);
      return { success: true, id: resData.id };
    } catch (err: any) {
      console.error('[Email] Error al conectar con Resend:', err);
      return { success: false, error: err.message };
    }
  }

  // Fallback seguro: Registro local/servidor sin bloquear
  console.log(`[Email Mock] Notificación de reserva generada para ${data.reservationId}:`);
  console.log(`  - Destinatario (Huésped): ${data.guestEmail}`);
  console.log(`  - Destinatario (Anfitrión): ${hostEmail}`);
  console.log(`  - Botón Anfitrión para Confirmar Pago Bizum: ${hostConfirmUrl}`);
  console.log(`  - Factura Solicitada: ${data.invoiceRequested ? `Sí (${data.invoiceCompanyName} / ${data.invoiceTaxId})` : 'No'}`);
  console.log(`  - Anticipo 50%: ${data.depositAmount || Math.round(data.grandTotal * 0.5)} € / Total: ${data.grandTotal} €`);

  return { success: true, mock: true };
}
