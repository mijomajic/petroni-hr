import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Vehicle } from '$lib/supabase';

export type BookingState = {
  step: number;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
  pickupTime: string;
  dropoffTime: string;
  numAdults: number;
  numChildren: number;
  plannedKm: number;
  destination: string;
  selectedVehicle: Vehicle | null;
  driverDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    licenseNumber: string;
    licenseCountry: string;
    address: string;
    city: string;
    zip: string;
    country: string;
  };
  extras: Record<string, number>;
  totalPrice: number;
};

const defaultState: BookingState = {
  step: 1,
  pickupLocation: '',
  dropoffLocation: '',
  pickupDate: '',
  dropoffDate: '',
  pickupTime: '10:00',
  dropoffTime: '10:00',
  numAdults: 2,
  numChildren: 0,
  plannedKm: 0,
  destination: '',
  selectedVehicle: null,
  driverDetails: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    licenseNumber: '',
    licenseCountry: 'HR',
    address: '',
    city: '',
    zip: '',
    country: 'Hrvatska',
  },
  extras: {},
  totalPrice: 0,
};

const stored: Partial<BookingState> = browser
  ? JSON.parse(sessionStorage.getItem('petroni_booking') || '{}')
  : {};

const initial: BookingState = {
  ...defaultState,
  ...stored,
  driverDetails: {
    ...defaultState.driverDetails,
    ...(stored.driverDetails ?? {})
  }
};

export const booking = writable<BookingState>(initial);

if (browser) {
  booking.subscribe(value => {
    sessionStorage.setItem('petroni_booking', JSON.stringify(value));
  });
}

export function resetBooking() {
  booking.set({
    ...defaultState,
    driverDetails: { ...defaultState.driverDetails },
    extras: {}
  });
}
