import { validate as cv_validate } from "class-validator-multi-lang";
import * as it from "class-validator-multi-lang/i18n/it.json";
import * as en from "class-validator-multi-lang/i18n/en.json";
import { ValidationError } from "class-validator";

export enum VALIDATION_LANGUAGE {
  IT = "IT",
  EN = "EN",
}

const ErrorMessagesByLangId = new Map<
  VALIDATION_LANGUAGE,
  {
    [key: string]: string;
  }
>();

ErrorMessagesByLangId.set(VALIDATION_LANGUAGE.IT, it);
ErrorMessagesByLangId.set(VALIDATION_LANGUAGE.EN, en);

export async function validate(
  model: object,
  lang: VALIDATION_LANGUAGE = VALIDATION_LANGUAGE.EN
) {
  let errorMessages = ErrorMessagesByLangId.get(lang);
  return cv_validate(model, {
    validationError: { target: false, value: false },
    stopAtFirstError: true,
    messages: errorMessages,
  });
}

export function parseValidationErrorsToMap(
  map: Map<string, string>,
  errors: ValidationError[]
) {
  map.clear();
  errors.forEach((element) => {
    let errorMessage = element.constraints
      ? (Object.values(element.constraints)[0] as string)
      : undefined;
    errorMessage = errorMessage?.replace(element.property, "");
    map.set(element.property, errorMessage);
  });
}
