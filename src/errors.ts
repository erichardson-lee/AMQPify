export abstract class AMQPError extends Error {
  public abstract type: string;
  public info?: unknown[];

  constructor(public message: string, ...info: unknown[]) {
    super(message);
    this.info = info;
  }

  public timestamp: Date = new Date();
}

export class AMQPClientError extends AMQPError {
  type = "CLIENT_ERROR";
}
export class AMQPServerError extends AMQPError {
  type = "SERVER_ERROR";
}

export type ErrorInfo = {
  type: string;
  message: string;
  info?: unknown;
  timestamp: string;
};

export const HandleErrors =
  (ctx: { messageId: string }) =>
  (e: unknown): ErrorInfo => {
    if (!(e instanceof Error)) {
      throw new Error("Non-Error Thrown");
    }

    if (e instanceof AMQPError) {
      if (e instanceof AMQPClientError) {
        console.error(ctx.messageId, e.message, e);
        return {
          type: e.type,
          message: e.message,
          info: e.info,
          timestamp: e.timestamp.toISOString(),
        };
      } else if (e instanceof AMQPServerError) {
        console.error(ctx.messageId, e.message, e);
        return {
          type: e.type,
          message: e.message,
          timestamp: e.timestamp.toISOString(),
        };
      }
    }
    return HandleErrors(ctx)(
      new AMQPServerError("Non-AMQP Error: " + e.message, e)
    );
  };
