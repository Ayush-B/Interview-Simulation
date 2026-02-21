import { Outlet, Link } from "react-router-dom";

export default function RootLayout() {
  return (
    <div style={{ padding: 16 }}>
      <nav style={{ display: "flex", gap: 12 }}>
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
      </nav>
      <hr />
      <Outlet />
    </div>
  );
}