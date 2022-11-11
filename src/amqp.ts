import { connect } from "https://deno.land/x/amqp/mod.ts";

const connection = await connect();
const channel = await connection.openChannel();

const queueName = "my.queue";
await channel.declareQueue({ queue: queueName });
await channel.consume({ queue: queueName }, async (args, props, data) => {
  console.log(JSON.stringify(args));
  console.log(JSON.stringify(props));
  console.log(new TextDecoder().decode(data));
  await channel.ack({ deliveryTag: args.deliveryTag });
});
