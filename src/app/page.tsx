import { redirect } from 'next/navigation';

// export const metadata: Metadata = {
//   title: 'Free Next.js Template for Startup and SaaS',
//   description: 'This is Home for Startup Nextjs Template',
//   // other metadata
// };

export default function Home() {
  redirect('/dashboard');
  // return <Landing />;
}
