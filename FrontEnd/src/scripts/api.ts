import axios from "axios";
import { LoginDTO } from "shared/dto/loginDTO";
import { UserDataDTO } from "shared/dto/userDataDTO";
import { PasswordRecoveryDTO } from "shared/dto/passwordRecoveryDTO";
import { NewPasswordDTO } from "shared/dto/newPasswordDTO";
import { NewPasswordResponseDTO } from "shared/dto/newPasswordResponseDTO";

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

  public async newPassword(newPasswordDTO: NewPasswordDTO) {
    let response = await axios.post(
      "http://localhost:60000/new-password",
      newPasswordDTO
    );
    return response.data as NewPasswordResponseDTO;
  }

  public async newPasswordCheck(newPasswordDTO: NewPasswordDTO) {
    let response = await axios.post(
      "http://localhost:60000/new-password-check",
      newPasswordDTO
    );
    return response.data as NewPasswordResponseDTO;
  }
}
