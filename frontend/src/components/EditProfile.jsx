import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../redux/authSlice.js";
import { api, getApiMessage, getAuthorizationHeader } from "../services/api.js";

function EditProfile() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    avatar: ""
  });
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/profile", {
        headers: {
          Authorization: getAuthorizationHeader()
        }
      });

      setForm({
        name: res.data.data?.name || "",
        email: res.data.data?.email || "",
        phone: res.data.data?.phone || "",
        password: "",
        avatar: res.data.data?.avatar || ""
      });
      setNotice(null);
    } catch (error) {
      setNotice({
        type: "danger",
        message: getApiMessage(error, "Cannot load profile.")
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      const data = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key !== "avatar") {
          data.append(key, value);
        }
      });

      if (avatar) {
        data.append("avatar", avatar);
      }

      const response = await api.put("/api/profile", data, {
        headers: {
          Authorization: getAuthorizationHeader()
        }
      });

      localStorage.setItem("user", JSON.stringify(response.data.data));
      setNotice({
        type: "success",
        message: "Profile updated successfully."
      });
      await fetchProfile();
    } catch (error) {
      setNotice({
        type: "danger",
        message: getApiMessage(error, "Update failed.")
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <main className="profile-page">
      <nav className="navbar navbar-expand navbar-light bg-white border-bottom">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/profile">TOEIC Luyen Thi</Link>
          <button className="btn btn-outline-danger btn-sm" type="button" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </nav>

      <section className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            <div className="card shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div>
                    <h1 className="h4 mb-1">Edit profile</h1>
                    <p className="text-secondary mb-0">Manage your TOEIC account</p>
                  </div>
                  {form.avatar && (
                    <img
                      src={`${import.meta.env.VITE_API_URL || ""}/uploads/${form.avatar}`}
                      alt="avatar"
                      width="64"
                      height="64"
                      className="rounded-circle object-fit-cover border"
                    />
                  )}
                </div>

                {notice && (
                  <div className={`alert alert-${notice.type}`} role="alert">
                    {notice.message}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="name">Name</label>
                    <input
                      className="form-control"
                      id="name"
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label" htmlFor="email">Email</label>
                    <input
                      className="form-control"
                      id="email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label" htmlFor="phone">Phone</label>
                    <input
                      className="form-control"
                      id="phone"
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label" htmlFor="password">Confirm password</label>
                    <input
                      className="form-control"
                      id="password"
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label" htmlFor="avatar">Avatar</label>
                    <input
                      className="form-control"
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={(event) => setAvatar(event.target.files?.[0] || null)}
                    />
                  </div>

                  <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Update profile"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default EditProfile;
