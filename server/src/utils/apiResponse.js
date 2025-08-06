export class ApiResponse {
  constructor(status, message = "success", data) {
    this.status = status;
    this.message = message;
    this.data = data;
    this.success = status < 400; // true if status code is less than 400
  }
}
