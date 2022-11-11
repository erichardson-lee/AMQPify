import { Amqpify, AMQPClientError, AMQPServerError } from "./mod.ts";

const amqp = await Amqpify.Create();

amqp.reqRes({
  queue: "test.greeter",
  bodySchema: "",
  returnType: "",
  handler: ({ body, props }) => {
    if (!props.replyTo) return;

    if (typeof body !== "string") {
      throw new AMQPClientError("Invalid Body Type");
    }

    if (Date.now() % 2 === 0) {
      if (Date.now() % 4 === 0) {
        throw new AMQPServerError("Random Proper Server Error");
      } else {
        throw new Error("Random Error");
      }
    }

    return `Hello ${body}!`;
  },
});

console.log("Listening 🚀");
