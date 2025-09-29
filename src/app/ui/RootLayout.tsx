import { Outlet } from 'react-router-dom';
import Shell from './layout/Shell';

function RootLayout() {
  return (
    <Shell>
      <Outlet />
    </Shell>
  );
}

export default RootLayout;


