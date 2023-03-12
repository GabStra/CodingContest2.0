import axios from "axios";
import { Login } from "shared/view_models/login";
export class Api {
  public async login(loginData: Login) {
    let response = await axios.post("http://localhost:60000/login", loginData);
  }
}
