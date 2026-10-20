# Apartamento Costa del Sol Suances — Web Oficial de Reserva Directa

Web oficial y motor de reservas directas para el alojamiento turístico **Apartamento Costa del Sol** en Suances (Cantabria), desarrollada desde cero con **Astro**, **Tailwind CSS v4** y **TypeScript**.

---

## 🏖️ Características del Alojamiento

- **Ubicación:** Frente a la playa, a **2 minutos a pie de la Playa de La Concha** (Suances, Cantabria).
- **Dimensiones:** 70 m² con luz natural y vistas al Mar Cantábrico.
- **Distribución:**
  - **3 Dormitorios** (Dormitorio 1: Cama de matrimonio; Dormitorio 2: Dos camas individuales; Dormitorio 3: Cama individual/nido).
  - **Salón - Comedor:** Sofá espacioso, Smart TV 50", mesa para 6 comensales y vistas al mar.
  - **Cocina totalmente equipada:** Nevera grande con congelador, cafetera, microondas, vitrocerámica y menaje completo.
  - **1 Baño completo:** Plato de ducha amplio con mampara, secador de pelo potente y toallas.
  - **Servicios:** WiFi 300 Mbps gratuito por fibra, calefacción, sábanas y amenities.

---

## 🚀 Arquitectura y Tecnologías

- **Framework:** [Astro](https://astro.build/) con SSR vía `@astrojs/node` y Tailwind CSS v4 con `@tailwindcss/vite`.
- **Motor de Reservas Interactivo:** Selector con [Flatpickr](https://flatpickr.js.org/) en español y bloqueo en tiempo real de fechas ya ocupadas.
- **Pasarelas de Pago:**
  - **Vía A (Instantánea):** Tarjeta de crédito/débito y Bizum automático mediante **Stripe Checkout**.
  - **Vía B (Manual sin comisiones):** Transferencia bancaria o Bizum manual con **bloqueo temporal de 2 horas** para adjuntar justificante por WhatsApp.
- **Sincronización Bidireccional iCal:**
  - `GET /api/availability.json`: Consulta en vivo y combina calendarios externos de Booking.com y Airbnb con las reservas directas locales.
  - `GET /api/calendar.ics`: Genera y exporta el archivo de calendario estándar RFC 5545 para sincronizar las reservas directas hacia Booking y Airbnb.

---

## 📦 Instalación y Desarrollo Local

```bash
# Entrar al proyecto
cd costa-del-sol-suances

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Previsualizar la compilación
npm run preview
```

---

## ⚙️ Variables de Entorno (`.env`)

Copia `.env.example` a `.env` y configura tus credenciales:

```env
PUBLIC_BASE_URL="http://localhost:4321"

# Sincronización iCal externa (Booking & Airbnb)
BOOKING_ICAL_URL="https://admin.booking.com/hotel/hoteladmin/ical.html?t=tu-token"
AIRBNB_ICAL_URL="https://www.airbnb.es/calendar/ical/tu-feed.ics"

# Stripe Checkout
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Tarifas directas
DEFAULT_PRICE_PER_NIGHT=110
CLEANING_FEE=40
MINIMUM_STAY_NIGHTS=2

# Vía B: Transferencia Bancaria y Bizum Manual
PAYMENT_BIZUM_PHONE="+34 600 123 456"
PAYMENT_BANK_IBAN="ES91 2100 0418 4502 0005 1332"
PAYMENT_BANK_BENEFICIARY="Ivan - Apartamento Costa del Sol Suances"
```

---

## 📌 Publicación en GitHub (@itorresano12)

El origen remoto ya está configurado a:
`https://github.com/itorresano12/costa-del-sol-suances.git`

Para autenticarte con GitHub CLI y crear el repositorio remoto:
```bash
gh auth login
gh repo create itorresano12/costa-del-sol-suances --public --source=. --remote=origin --push
```

O si creas el repositorio vacío en GitHub Web:
```bash
git push -u origin main
```
