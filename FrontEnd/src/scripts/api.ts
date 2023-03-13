import axios from "axios";
import { LoginDTO } from "shared/dto/loginDTO";
import { UserDataDTO } from "shared/dto/userDataDTO";
import { PasswordRecoveryDTO } from "shared/dto/passwordRecoveryDTO";

export class Api {
  public async login(loginData: LoginDTO) {
    let response = await axios.post("http://localhost:60000/login", loginData);
    return response.data as UserDataDTO;
  }

  public async sendPasswordRecoveryEmail(
    passwordRecoveryData: PasswordRecoveryDTO
  ) {
    let response = await axios.post(
      "http://localhost:60000/password-reset",
      passwordRecoveryData
    );
    return response.data as UserDataDTO;
  }
}
