import { validate, VALIDATION_LANGUAGE } from "./helper/validator";
import { Login } from "./view_models/login";

async function main() {
  let test = new Login();
  test.email = "PIPPO";
  console.log(await validate(test, VALIDATION_LANGUAGE.IT));
}

main();
