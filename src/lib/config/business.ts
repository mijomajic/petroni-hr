export const BUSINESS = {
  name: 'Alderway Campers',
  shortName: 'Alderway',
  legalName: 'Alderway Campers',
  tagline: 'More road. Less rush.',
  description: 'Premium camper hire, thoughtfully prepared vehicles and practical support for unhurried road trips.',
  email: 'hello@alderwaycampers.com',
  phone: '+353 1 687 2048',
  phoneHref: 'tel:+35316872048',
  address: '18 Alder Way, Northmere',
  locality: 'Northmere',
  postalCode: 'N04 R2Y6',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=18%20Alder%20Way%2C%20Northmere',
  logo: '/brand/alderway-logo.svg',
  mark: '/brand/alderway-mark.svg',
  defaultImage: '/images/brand/alderway-hero.webp',
  storagePrefix: 'alderway',
  bookingReferencePrefix: 'ALD',
  rentalOnlinePaymentsEnabled: false as boolean,
  currency: 'EUR',
  defaultLocale: 'en-GB'
} as const;

export type BusinessConfig = typeof BUSINESS;

export const CLIENT_STORAGE_KEYS = {
  locale: `${BUSINESS.storagePrefix}_locale`,
  cart: `${BUSINESS.storagePrefix}_cart`,
  booking: `${BUSINESS.storagePrefix}_booking`,
  bookingResult: `${BUSINESS.storagePrefix}_booking_result`,
  orderResult: `${BUSINESS.storagePrefix}_order_result`
} as const;
