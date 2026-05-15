const bcrypt = require('bcryptjs');

async function run() {
  const hash = await bcrypt.hash('mmKK12**', 10);
  console.log(hash);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
