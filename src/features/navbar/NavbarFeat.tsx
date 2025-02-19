import { fetchCurrentCompany, fetchUserCompanies } from '@/shared/actions/company.actions';
import { getCurrentUserProfile, getUserNotifications } from './actions/actions.navbar';
import { Navbar } from './components/_Navbar';

async function NavbarFeat() {
  const user = await getCurrentUserProfile();
  const notifications = await getUserNotifications();
  const { sharedCompanies, allCompanies } = await fetchUserCompanies(user?.id || '');
  const currentCompany = await fetchCurrentCompany();

  return (
    <Navbar
      user={user}
      notifications={notifications}
      companies={{
        sharedCompanies,
        allCompanies,
        currentCompany,
      }}
    />
  );
}

export default NavbarFeat;
