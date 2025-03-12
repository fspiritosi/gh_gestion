// import { AlertComponent } from '@/components/AlertComponent'
import NavbarFeat from '@/features/(Layout)/navbar/NavbarFeat';
import SidebarFeat from '@/features/(Layout)/sidebar/SidebarFeat';
import { Inter } from 'next/font/google';
import '../globals.css';
const font = Inter({ subsets: ['latin'] });

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`grid grid-rows-[auto,1fr] grid-cols-[auto,1fr] h-screen `}>
      <div className="row-span-2 ">
        <SidebarFeat />
      </div>
      <div className="border-r border-b border-muted/50">
        <NavbarFeat />
      </div>
      <div>{children}</div>
    </div>
  );
}
