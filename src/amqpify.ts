import { AMQPFunction } from "./amqpHandler.ts";
import { HandleErrors } from "./errors.ts";

import {
  connect,
  AmqpConnection,
  AmqpConnectOptions,
  AmqpChannel,
} from "https://deno.land/x/amqp/mod.ts";

export class Amqpify {
  protected constructor(
    private readonly connection: AmqpConnection,
    private readonly channels: AmqpChannel[]
  ) {}

  public static async Create(opts?: { conn?: AmqpConnectOptions }) {
    const conn = await connect(opts?.conn ?? {});
    const channel = await conn.openChannel();

    return new Amqpify(conn, [channel]);
  }

  public reqRes(def: AMQPFunction, channelId = 0): this {
    const channel = this.channels[channelId];

    channel.declareQueue({ queue: def.queue });

    channel.consume({ queue: def.queue }, async (args, props, data) => {
      const mID = props.messageId ?? crypto.randomUUID();

      console.debug(`[${mID}] Recieved Message`);

      try {
        const body = JSON.parse(new TextDecoder().decode(data));
        console.debug(`[${mID}] BODY: ${body}`);
        console.debug(`[${mID}] props: ${JSON.stringify(props)}`);

        const res = await Promise.resolve(def.handler({ args, props, body }));

        reply(channel, props.replyTo, mID, res);
      } catch (e) {
        const error = HandleErrors({ messageId: mID })(e);

        reply(channel, props.replyTo, mID, error);
      }
    });

    return this;
  }
}

function reply<Msg>(
  channel: AmqpChannel,
  replyTo: string | undefined,
  mID: string,
  message: Msg
) {
  if (replyTo) {
    channel.publish(
      { routingKey: replyTo },
      { messageId: mID },
      new TextEncoder().encode(JSON.stringify(message))
    );
  }
}
