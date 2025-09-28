import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header, Footer } from './components/layout';
import { routes } from './router/routes';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './router/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main>
            <Suspense
              fallback={
                <div className="flex items-center justify-center py-24">
                  <span className="text-sm text-gray-500">Loading…</span>
                </div>
              }
            >
              <Routes>
                {routes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={
                      route.protected ? (
                        <ProtectedRoute component={route.component} roles={route.roles} />
                      ) : (
                        <route.component />
                      )
                    }
                  />
                ))}
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
