import type { Session, SupabaseClient, User } from '@supabase/supabase-js';

declare global {
	interface BoxNowLockerSelection {
		boxnowLockerId?: string | number;
		boxnowLockerAddressLine1?: string;
		boxnowLockerPostalCode?: string | number;
	}

	interface Window {
		_bn_map_widget_config?: {
			partnerId?: string | number;
			parentElement: string;
			buttonSelector: string;
			type: 'popup';
			gps: boolean;
			autoclose: boolean;
			afterSelect: (selected: BoxNowLockerSelection) => void;
		};
	}

	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient;
			safeGetSession: () => Promise<{
				session: Session | null;
				user: User | null;
			}>;
		}
		interface PageData {
			session?: Session | null;
			user?: User | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
