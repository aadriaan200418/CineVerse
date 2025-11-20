import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const role = localStorage.getItem("role");

  if (role === "admin") {
    return children;
  } 
  else {
    return <Navigate to="/home" replace />;
  }
}
