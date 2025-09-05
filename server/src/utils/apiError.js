export class AppError extends Error {
  constructor(message, { status = 500, code = 'INTERNAL', meta = {} } = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.meta = meta;
  }
}
