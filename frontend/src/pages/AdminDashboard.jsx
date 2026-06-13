import { Link, useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <main className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Admin dashboard</h1>
          <p className="text-secondary mb-0">{user.email || "Admin account"}</p>
        </div>
        <button className="btn btn-outline-danger" type="button" onClick={logout}>
          Sign out
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="h5">Account</h2>
          <p className="mb-3">Role: {user.role || "admin"}</p>
          <Link className="btn btn-primary" to="/profile">Edit profile</Link>
        </div>
      </div>
    </main>
  );
}

export default AdminDashboard;
