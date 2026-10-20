/**
 * Configuración centralizada de marca, contacto y firma de autor
 * Permite configuración directa en este archivo o mediante variables de entorno en .env / Vercel
 */
const phoneRaw = process.env.PUBLIC_WHATSAPP_PHONE || '34600000000';
const cleanPhone = phoneRaw.replace(/[^0-9]/g, '');

const prefilledMessage = encodeURIComponent(
  'Hola Iván, estoy interesado en el Apartamento Costa del Sol Suances. ¿Me puedes confirmar disponibilidad?'
);

export const SITE_CONFIG = {
  // 📱 Teléfono de WhatsApp para reservas directas (Modificar aquí o mediante PUBLIC_WHATSAPP_PHONE en .env)
  whatsappPhone: cleanPhone,
  whatsappDisplayPhone: process.env.PUBLIC_DISPLAY_PHONE || '+34 600 000 000',

  // Enlace directo de WhatsApp con mensaje inteligente prefijado
  whatsappUrl: `https://wa.me/${cleanPhone}?text=${prefilledMessage}`,

  // Identidad de diseño (unificada con House Manager y Ramia Studio)
  designerName: 'Iván Torresano',
  designerUrl: 'https://github.com/itorresano12',

  // Datos del anfitrión y alojamiento
  hostName: process.env.HOST_NAME || 'Iván Torresano',
  hostEmail: process.env.HOST_EMAIL || 'info@costadelsolsuances.es',
  apartmentName: 'Apartamento Costa del Sol Suances',
  touristLicense: process.env.PUBLIC_TOURIST_LICENSE || 'VUT-Cantabria Nº G-12345',
};
