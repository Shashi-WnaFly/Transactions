import validator from "validator";

const validateRegister = ({
  firstName,
  lastName,
  middleName,
  emailId,
  password,
}: {
  firstName: string;
  lastName: string;
  middleName: string;
  emailId: string;
  password: string;
}) => {
  if (!firstName || !lastName || !emailId || !password) {
    throw new Error("All fields are required!");
  }

  if (
    firstName.length < 2 ||
    firstName.length > 30 ||
    lastName.length < 2 ||
    lastName.length > 30 ||
    middleName?.length > 30
  ) {
    throw new Error("Name is Invalid!");
  }

  if (!validator.isEmail(emailId)) {
    throw new Error("Email is Invalid!");
  }

  if (
    !validator.isStrongPassword(password, {
      minUppercase: 1,
      minLowercase: 1,
      minLength: 8,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    throw new Error("Password is Invalid!");
  }
};

export { validateRegister };
