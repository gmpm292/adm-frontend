// import React from 'react';
// import { Navigate, Outlet } from 'react-router-dom';
// import useAuth from '../../../hooks/useAuth';

// const ProtectedRoute = () => {
//   const { isAuthenticated, loading } = useAuth();

//   if (loading) {
//     return <div>Cargando...</div>; // Muestra un spinner o algo similar
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   return <Outlet />;
// };

// export default ProtectedRoute;

import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  console.log("isAuthenticated", isAuthenticated);
  console.log("loading", loading);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    // Si la carga tarda más de 5 segundos, asumimos que hay un problema
    const timeout = setTimeout(() => {
      if (loading) {
        setHasTimedOut(true);
      }
    }, 5000); // 5 segundos

    return () => clearTimeout(timeout); // Limpia el timeout al desmontar el componente
  }, [loading]);

  if (loading && !hasTimedOut) {
    return <div>Cargando...</div>; // Muestra un spinner o algo similar
  }

  console.log("loading", loading);
  console.log("hasTimedOut", hasTimedOut);

  if (hasTimedOut) {
    //return <Navigate to="/login" replace />;
    //return <div>Error: Tiempo de espera agotado. Inténtalo de nuevo.</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  console.log("return <Outlet />");
  return <Outlet />;
};

export default ProtectedRoute;
