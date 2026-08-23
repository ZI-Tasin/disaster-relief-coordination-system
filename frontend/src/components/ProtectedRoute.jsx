import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../context/AuthContext";

function isTokenValid(token) {
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);

    if (!decoded?.exp) return false;

    return Date.now() < decoded.exp * 1000;
  } catch {
    return false;
  }
}

export default function ProtectedRoute({ children, role }) {
  const { token, user, authReady, logout } = useAuth();
  const location = useLocation();

  /*
   * CRITICAL:
   *
   * Do not redirect while AuthContext is restoring
   * localStorage authentication state.
   *
   * This prevents:
   *
   * login -> admin route -> login -> admin route
   */
  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-800" />
          <p className="text-sm text-gray-600">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  /*
   * No valid token.
   */
  if (!isTokenValid(token)) {
    if (token || user) {
      logout(false);
    }

    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  /*
   * Token exists but user information is missing.
   */
  if (!user) {
    logout(false);

    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  /*
   * Role-protected route.
   */
  if (role && user.role !== role) {
    /*
     * Admin users should stay inside the admin area.
     */
    if (user.role === "admin") {
      if (location.pathname !== "/admin/dashboard") {
        return <Navigate to="/admin/dashboard" replace />;
      }

      return children;
    }

    /*
     * Non-admin users cannot access admin routes.
     */
    if (location.pathname !== "/dashboard") {
      return <Navigate to="/dashboard" replace />;
    }

    return children;
  }

  return children;
}
