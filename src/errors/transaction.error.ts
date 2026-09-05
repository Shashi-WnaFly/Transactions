export class InsufficientFundsError extends Error {
  constructor(message = "Insufficient funds") {
    super(message);
    this.name = "InsufficientFundsError";
  }
}

export class InvalidRecipientError extends Error {
  constructor(message = "Recipient account is invalid or inactive") {
    super(message);
    this.name = "InvalidRecipientError";
  }
}

export class InvalidPayerError extends Error {
  constructor(message = "Payer account is invalid or inactive") {
    super(message);
    this.name = "InvalidPayerError";
  }
}

export class ValidationError extends Error {
  constructor(message = "Invalid transaction request") {
    super(message);
    this.name = "ValidationError";
  }
}
