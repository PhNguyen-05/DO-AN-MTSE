// test.js
const fetch = require("node-fetch");

async function testProfile() {
  const res = await fetch("http://localhost:5000/api/profile", {
    method: "PUT",
    headers: {
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMDEyODAyNGU5ODBmZGRmODBlNmQ2MSIsImlhdCI6MTc3ODQ2MDY3NH0.nDJTr7mwGf6SARnxps0Do0XhJK9x7E5HNim-pmV4aRk"
    }
  });
  const data = await res.json();
  console.log(data);
}

testProfile();
