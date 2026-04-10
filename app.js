
const express = require('express');
const app = express();
const userRoutes = require("./src/routes/userRoutes");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use('/api/users', userRoutes);









const port = 3000;
app.listen(port, () => {
  console.log("server starting");
});
