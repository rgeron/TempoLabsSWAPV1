import express from "express";
import cors from "cors";
import stripeRouter from "./src/server/routes/stripe";

const app = express();

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Use the stripe routes
app.use("/api", stripeRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
