import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import GlobalStyle from './styles/GlobalStyle';
import { lightTheme } from './styles/theme';

import FeedPage from './pages/FeedPage';
import DemoPage from './pages/DemoPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<FeedPage />} />
          <Route path='/demo' element={<DemoPage />} />
          <Route path='/admin' element={<AdminPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
