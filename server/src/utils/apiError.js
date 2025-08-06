export class ApiError extends Error {
  constructor(status, message = "Something went wrong", errors = []) {
    super(message); // Call parent Error constructor

    this.status = status; // HTTP status code (e.g., 400, 404, 500)

    this.data = null; // Optional data field (usually null in errors)

    this.message = message; // Human-readable error message

    this.success = false; // Always false for errors

    this.errors = errors; // Array of additional error details
  }
}
