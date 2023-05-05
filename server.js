const config = require("./config/index");
const { app } = require("./app");

app.listen(config.PORT, () => {
  console.log(`Server is Running ${config.PORT}`);
});
