import { connect } from "https://deno.land/x/amqp@v0.17.0/mod.ts";

const name = prompt("What is your name?");

const channel = await (await connect()).openChannel();

setTimeout(() => {
  console.error("Timeout");
  return Deno.exit(1);
}, 3000);

channel.declareQueue({ queue: "amq.rabbitmq.reply-to" });
channel.consume(
  { queue: "amq.rabbitmq.reply-to", noAck: true },
  (_, __, body) => {
    console.log(JSON.parse(new TextDecoder().decode(body)));
    Deno.exit(0);
  }
);

channel.publish(
  { routingKey: "test.greeter" },
  { replyTo: "amq.rabbitmq.reply-to" },
  new TextEncoder().encode(`${name}`)
);

console.log("Done!");
