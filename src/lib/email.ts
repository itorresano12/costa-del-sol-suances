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
  paymentMethod: 'stripe' | 'transfer_manual' | 'bizum';
  status: string;
  expiresAt?: string;
  bankDetails?: {
    bizumPhone: string;
    bankIban: string;
    bankBeneficiary: string;
    concept: string;
  };
}

/**
 * Genera la plantilla HTML boutique para el correo de confirmación de reserva
 */
export function generateBookingEmailHtml(data: BookingEmailData): string {
  const baseUrl = process.env.PUBLIC_BASE_URL || 'https://costa-del-sol-suances.vercel.app';
  const guideUrl = `${baseUrl}/guia-suances.pdf`;
  const isTransfer = data.paymentMethod === 'transfer_manual' || data.paymentMethod === 'bizum';

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
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border: 1px solid #e7e5e4;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    }
    .header {
      background: #0f172a;
      color: #ffffff;
      padding: 32px 28px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 400;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 6px 0 0 0;
      font-size: 13px;
      color: #cbd5e1;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .content {
      padding: 32px 28px;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 14px;
      background-color: ${isTransfer ? '#fef3c7' : '#ecfdf5'};
      color: ${isTransfer ? '#92400e' : '#065f46'};
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .booking-card {
      background-color: #fafaf9;
      border: 1px solid #e7e5e4;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .booking-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f5f5f4;
      font-size: 14px;
    }
    .booking-row:last-child {
      border-bottom: none;
      padding-top: 12px;
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
    }
    .cta-button {
      display: block;
      width: 100%;
      box-sizing: border-box;
      background: #0f172a;
      color: #ffffff !important;
      text-align: center;
      padding: 14px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      margin: 24px 0 16px 0;
    }
    .whatsapp-button {
      display: block;
      width: 100%;
      box-sizing: border-box;
      background: #25D366;
      color: #ffffff !important;
      text-align: center;
      padding: 12px 20px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      margin-bottom: 24px;
    }
    .policy-box {
      background: #f8fafc;
      border-left: 4px solid #0f172a;
      padding: 14px 16px;
      border-radius: 4px;
      font-size: 13px;
      color: #475569;
      margin-bottom: 24px;
    }
    .footer {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <!-- Header -->
    <div class="header">
      <h1>Apartamento Costa del Sol Suances</h1>
      <p>Suances · Cantabria</p>
    </div>

    <!-- Content -->
    <div class="content">
      <div style="text-align: center;">
        <span class="status-badge">
          ${isTransfer ? '⏳ Pre-reserva Temporal (Bloqueo 2h)' : '✓ Reserva Confirmada'}
        </span>
      </div>

      <p>Hola <strong>${data.guestName}</strong>,</p>
      <p>
        ${
          isTransfer
            ? 'Hemos bloqueado de forma exclusiva tus fechas durante <strong>120 minutos</strong> para garantizar tu estancia sin comisiones de intermediarios.'
            : '¡Tu estancia frente a la Playa de La Concha está 100% confirmada! Estamos encantados de darte la bienvenida.'
        }
      </p>

      <!-- Resumen de Reserva -->
      <div class="booking-card">
        <div class="booking-row">
          <span>Identificador de Reserva:</span>
          <strong>${data.reservationId}</strong>
        </div>
        <div class="booking-row">
          <span>Entrada (Check-in):</span>
          <span>${data.checkIn} (a partir de las 16:00 h)</span>
        </div>
        <div class="booking-row">
          <span>Salida (Check-out):</span>
          <span>${data.checkOut} (hasta las 11:00 h)</span>
        </div>
        <div class="booking-row">
          <span>Duración de la estancia:</span>
          <span>${data.nights} noche${data.nights > 1 ? 's' : ''}</span>
        </div>
        <div class="booking-row">
          <span>Huéspedes:</span>
          <span>${data.guests} personas</span>
        </div>
        <div class="booking-row">
          <span>Importe Total:</span>
          <span>${data.grandTotal} €</span>
        </div>
      </div>

      ${
        isTransfer && data.bankDetails
          ? `
      <!-- Instrucciones de Pago Manual -->
      <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 18px; margin-bottom: 24px; font-size: 13px;">
        <h4 style="margin: 0 0 8px 0; color: #92400e; font-size: 14px;">Datos para completar el pago (Bizum o Transferencia):</h4>
        <p style="margin: 4px 0;">📱 <strong>Bizum:</strong> ${data.bankDetails.bizumPhone}</p>
        <p style="margin: 4px 0;">🏦 <strong>IBAN:</strong> ${data.bankDetails.bankIban}</p>
        <p style="margin: 4px 0;">👤 <strong>Beneficiario:</strong> ${data.bankDetails.bankBeneficiary}</p>
        <p style="margin: 4px 0;">📝 <strong>Concepto:</strong> ${data.bankDetails.concept}</p>
        <p style="margin: 8px 0 0 0; color: #b45309; font-style: italic;">
          Por favor, envíanos el comprobante por WhatsApp para validar definitivamente la reserva antes del vencimiento.
        </p>
      </div>
      `
          : ''
      }

      <!-- Política de Cancelación -->
      <div class="policy-box">
        <strong>🛡️ Política de cancelación flexible:</strong> Cancelación gratuita con reembolso íntegro hasta 7 días antes de la fecha de llegada.
      </div>

      <!-- Descarga de Guía de Suances -->
      <a href="${guideUrl}" class="cta-button" target="_blank">
        📖 Descargar Guía Exclusiva de Suances y Normas de la Casa
      </a>

      <!-- Contacto Anfitrión WhatsApp -->
      <a href="${SITE_CONFIG.whatsappUrl}" class="whatsapp-button" target="_blank">
        💬 Contactar con Iván (Anfitrión) por WhatsApp
      </a>

      <p style="font-size: 13px; color: #78716c;">
        Si tienes cualquier duda antes de tu viaje o necesitas recomendaciones sobre restaurantes, playas o alquiler de tablas de surf, escríbenos directamente.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin: 0 0 4px 0;">Apartamento Costa del Sol Suances · C/ Ceballos, Suances, Cantabria</p>
      <p style="margin: 0;">${SITE_CONFIG.touristLicense} · Diseñado por ${SITE_CONFIG.designerName}</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Envía la notificación de reserva al huésped con copia oculta (BCC) al anfitrión
 */
export async function sendBookingConfirmation(data: BookingEmailData): Promise<{
  success: boolean;
  mock?: boolean;
  id?: string;
  error?: string;
}> {
  const hostEmail = process.env.HOST_EMAIL || SITE_CONFIG.hostEmail;
  const resendApiKey = process.env.RESEND_API_KEY;
  const htmlContent = generateBookingEmailHtml(data);
  const isTransfer = data.paymentMethod === 'transfer_manual' || data.paymentMethod === 'bizum';
  const subject = isTransfer
    ? `⏳ Pre-Reserva Recibida [${data.reservationId}] - Apartamento Costa del Sol Suances`
    : `✓ Confirmación de Reserva [${data.reservationId}] - Apartamento Costa del Sol Suances`;

  // Si existe clave de Resend en el entorno, realizamos envío real vía API
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Costa del Sol Suances <reservas@costadelsolsuances.es>',
          to: [data.guestEmail],
          bcc: [hostEmail],
          reply_to: hostEmail,
          subject,
          html: htmlContent,
        }),
      });

      const resData = await response.json();
      if (response.ok) {
        console.log(`[Email] Correo enviado exitosamente vía Resend a ${data.guestEmail} (BCC: ${hostEmail}):`, resData.id);
        return { success: true, id: resData.id };
      } else {
        console.warn('[Email] Fallo en API Resend:', resData);
        return { success: false, error: resData.message };
      }
    } catch (err: any) {
      console.error('[Email] Error al conectar con Resend:', err);
      return { success: false, error: err.message };
    }
  }

  // Fallback: Modo registro en servidor / mock en local o Vercel sin API Key aún configurada
  console.log(`[Email Mock] Simulación de correo para reserva ${data.reservationId}:`);
  console.log(`  - Destinatario: ${data.guestEmail}`);
  console.log(`  - BCC (Anfitrión): ${hostEmail}`);
  console.log(`  - Asunto: ${subject}`);
  console.log(`  - Total: ${data.grandTotal} €`);
  console.log(`  - CheckIn: ${data.checkIn} -> CheckOut: ${data.checkOut}`);

  return { success: true, mock: true };
}

