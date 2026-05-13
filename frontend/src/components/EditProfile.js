import React, {
  useState,
  useEffect
} from "react";

import axios from "axios";

function EditProfile() {

  const [form, setForm] =
    useState({

      name: "",

      email: "",

      phone: "",

      password: "",

      avatar: ""
    });

  const [avatar, setAvatar] =
    useState(null);

  useEffect(() => {

    fetchProfile();

  }, []);

  const fetchProfile =
    async () => {

      try {

        const res =
          await axios.get(
            "http://localhost:5000/api/profile",
            {
              headers: {
                Authorization:
                  localStorage.getItem(
                    "token"
                  )
              }
            }
          );

        setForm({

          name:
            res.data.data.name || "",

          email:
            res.data.data.email || "",

          phone:
            res.data.data.phone || "",

          password: "",

          avatar:
            res.data.data.avatar || ""
        });

      }
      catch (err) {

        console.log(err);

        alert(
          "Cannot load profile"
        );
      }
    };

  const handleChange =
    (e) => {

      setForm({

        ...form,

        [e.target.name]:
          e.target.value
      });
    };

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        const data =
          new FormData();

        Object.keys(form)
          .forEach((key) => {

            if (
              key !== "avatar"
            ) {

              data.append(
                key,
                form[key]
              );
            }
          });

        if (avatar) {

          data.append(
            "avatar",
            avatar
          );
        }

        const res =
          await axios.put(

            "http://localhost:5000/api/profile",

            data,

            {
              headers: {

                Authorization:
                  localStorage.getItem(
                    "token"
                  )
              }
            }
          );

        alert(
          "Profile updated!"
        );

        console.log(
          res.data
        );

        fetchProfile();

      }
      catch (err) {

        console.log(err);

        alert(
          err.response?.data?.message ||
          "Update failed"
        );
      }
    };

  return (

    <div
      style={{
        width: "400px",
        margin: "50px auto",
        padding: "20px",
        border:
          "1px solid gray",
        borderRadius: "10px"
      }}
    >

      <h2>Edit Profile</h2>

      {
        form.avatar && (

          <img
            src={
              `http://localhost:5000/uploads/${form.avatar}`
            }
            alt="avatar"
            width="120"
            height="120"
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: "20px"
            }}
          />
        )
      }

      <form
        onSubmit={handleSubmit}
      >

        <input
          type="text"
          name="name"
          value={form.name}
          placeholder="Name"
          onChange={
            handleChange
          }
          style={{
            width: "100%",
            padding: "10px",
            marginBottom:
              "10px"
          }}
        />

        <input
          type="email"
          name="email"
          value={form.email}
          placeholder="Email"
          onChange={
            handleChange
          }
          style={{
            width: "100%",
            padding: "10px",
            marginBottom:
              "10px"
          }}
        />

        <input
          type="text"
          name="phone"
          value={form.phone}
          placeholder="Phone"
          onChange={
            handleChange
          }
          style={{
            width: "100%",
            padding: "10px",
            marginBottom:
              "10px"
          }}
        />

        <input
          type="password"
          name="password"
          value={form.password}
          placeholder="Confirm Password"
          onChange={
            handleChange
          }
          style={{
            width: "100%",
            padding: "10px",
            marginBottom:
              "10px"
          }}
        />

        <input
          type="file"
          onChange={(e) =>
            setAvatar(
              e.target.files[0]
            )
          }
          style={{
            marginBottom:
              "20px"
          }}
        />

        <br />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            cursor: "pointer"
          }}
        >
          Update Profile
        </button>

      </form>

    </div>
  );
}

export default EditProfile;