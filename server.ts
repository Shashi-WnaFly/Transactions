import app from "./src/app";
import connectDB from "./src/configs/connectDB";

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    console.log("Database is successfully connected.");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(() => {
    console.log("database is not connected!");
  });
