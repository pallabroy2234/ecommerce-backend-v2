// class ErrorHandler extends Error {
// 	constructor(
// 		public message: string,
// 		public statusCode: number,
// 	) {
// 		super(message);
// 		this.statusCode = statusCode;
// 	}
// }
class ErrorHandler extends Error {
    // public payload: any;
    constructor(message, statusCode) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.statusCode = statusCode;
        // this.payload = payload;
    }
}
export default ErrorHandler;
