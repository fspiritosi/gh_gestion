import { verifyUserRoleInCompany } from '@/app/server/GET/actions';
import { getCurrentPath } from '@/shared/actions/actions.navbar';
import { cookies } from 'next/headers';
import { Sidebar } from './components/Sidebar';

async function SidebarFeat() {
  const pathname = await getCurrentPath();
  const userData = await verifyUserRoleInCompany();
  const isActive = cookies().get('sidebar_state')?.value;

  return (
    <Sidebar
      pathname={pathname}
      role={typeof userData === 'string' ? '' : userData.rol}
      userModules={typeof userData === 'string' ? null : userData.modulos}
      isActive={isActive}
    />
  );
}

export default SidebarFeat;
