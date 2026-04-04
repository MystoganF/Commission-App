import { Outlet } from 'react-router-dom';
import ClientNavbar from '../../components/layout/ClientNavbar'; // Adjusted path
import styles from './ClientLayout.module.css';

export default function ClientLayout() {
  return (
    <div className={styles.appContainer}>
      <ClientNavbar />
      
      <main className={styles.mainContent}>
        <Outlet /> 
      </main>
      
      {/* Footer can go here later */}
    </div>
  );
}