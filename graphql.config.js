require("dotenv").config({ path: "./.env.local" });
module.exports = { schema: `${process.env.NEXT_PUBLIC_FONTDUE_URL}/graphql` };
