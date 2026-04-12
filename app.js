
const express = require('express');
const app = express();
const userRoutes = require("./src/routes/userRoutes");
const applicationRoutes = require("./src/routes/applicationRoutes")
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

  app.use('/api/users', userRoutes);
  app.use('/send/applications', applicationRoutes);








const port = 3000;
app.listen(port, () => {
  console.log("server starting");
});
