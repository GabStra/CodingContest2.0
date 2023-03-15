import axios from "axios";
import { LoginDTO } from "shared/dto/loginDTO";
import { UserDataDTO } from "shared/dto/userDataDTO";
import { PasswordRecoveryDTO } from "shared/dto/passwordRecoveryDTO";
import {
  NewPasswordDTO,
  NewPasswordResponseDTO,
} from "shared/dto/newPasswordDTO";
import {
  RegistrationDTO,
  RegistrationResponseDTO,
} from "shared/dto/registrationDTO";
import { VerifyDTO, VerifyResponseDTO } from "shared/dto/verifyDTO";

export class Api {
  public async login(loginData: LoginDTO) {
    let response = await axios.post("http://localhost:60000/login", loginData, {
      withCredentials: true,
    });
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

  public async registration(registrationDTO: RegistrationDTO) {
    let response = await axios.post(
      "http://localhost:60000/registration",
      registrationDTO
    );
    return response.data as RegistrationResponseDTO;
  }

  public async verify(registrationDTO: VerifyDTO) {
    let response = await axios.post(
      "http://localhost:60000/verify",
      registrationDTO
    );
    return response.data as VerifyResponseDTO;
  }

  public async logout() {
    let response = await axios.post("http://localhost:60000/logout", null, {
      withCredentials: true,
    });
    return response.data;
  }
}
