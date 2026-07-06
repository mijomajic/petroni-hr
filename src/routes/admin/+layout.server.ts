import { guardAdminPage } from '$lib/admin.server';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
  if (event.url.pathname === '/admin/login') return { administrator: null };
  const administrator = await guardAdminPage(event);
  return {
    administrator: {
      email: administrator.email,
      role: administrator.role
    }
  };
};
