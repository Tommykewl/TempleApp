import express from "express";
import addControllers from "./controllers/index.js";
import connectDB from "./config/db.js";
import useAuth from "./auth/auth.js";

console.log("Starting Application");

connectDB();

const app = express();

useAuth(app);

addControllers(app);

// Start the server at port 4000
app.listen(4000, () => {
  console.log("Running a GraphQL API server at http://localhost:4000/graphql");
});