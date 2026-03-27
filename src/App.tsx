import { HashRouter, Routes, Route } from 'react-router-dom';
import { ActionsProvider } from '@/context/ActionsContext';
import { Layout } from '@/components/Layout';
import DashboardOverview from '@/pages/DashboardOverview';
import AdminPage from '@/pages/AdminPage';
import KategoriePage from '@/pages/KategoriePage';
import AusruestungszuweisungPage from '@/pages/AusruestungszuweisungPage';
import SchnellausgabePage from '@/pages/SchnellausgabePage';
import PersonalPage from '@/pages/PersonalPage';
import AusruestungsgegenstandPage from '@/pages/AusruestungsgegenstandPage';

export default function App() {
  return (
    <HashRouter>
      <ActionsProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="kategorie" element={<KategoriePage />} />
            <Route path="ausruestungszuweisung" element={<AusruestungszuweisungPage />} />
            <Route path="schnellausgabe" element={<SchnellausgabePage />} />
            <Route path="personal" element={<PersonalPage />} />
            <Route path="ausruestungsgegenstand" element={<AusruestungsgegenstandPage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>
        </Routes>
      </ActionsProvider>
    </HashRouter>
  );
}
