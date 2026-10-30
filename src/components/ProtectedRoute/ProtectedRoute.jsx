import { useEffect } from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ isLoggedIn, isCheckingToken, onUnauthorized, children }) {
  const shouldRedirect = !isCheckingToken && !isLoggedIn;

  useEffect(() => {
    if (shouldRedirect) onUnauthorized();
  }, [shouldRedirect, onUnauthorized]);

  if (isCheckingToken) return null;
  if (!isLoggedIn) return <Navigate to="/" replace />;
  return children;
}

export default ProtectedRoute;
