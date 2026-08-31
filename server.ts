import app from "./src/app";
import connectDB from "./src/configs/connectDB";

connectDB()
  .then(() => {
    console.log("Database is successfully connected.");
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  })
  .catch(() => {
    console.log("database is not connected!");
  });
