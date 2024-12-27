class CustomError extends Error {
    status: number | null;
    reason: any;

    constructor(message: string, status?: number, reason?: any) {
        super(message);
        this.status = status || null;
        this.reason = reason || null;
        Object.setPrototypeOf(this, new.target.prototype); // Restore prototype chain
    }
}

export default CustomError;
