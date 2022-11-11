import { BasicDeliver, BasicProperties } from "https://deno.land/x/amqp/mod.ts";

type AMQPHandlerOpts<Body = unknown, Returns = unknown> = {
  queue: string;

  bodySchema: Body;
  returnType: Returns;
};

type AMQPHandlerCtx<Opts extends AMQPHandlerOpts> = {
  args: BasicDeliver;
  props: BasicProperties;
  body: Opts["bodySchema"];
};

type AMQPHandler<opts extends AMQPHandlerOpts = AMQPHandlerOpts> =
  | AMQPAsyncHandler<opts>
  | AMQPSyncHandler<opts>;

type AMQPSyncHandler<opts extends AMQPHandlerOpts> = (
  ctx: AMQPHandlerCtx<opts>
) => opts["returnType"];

type AMQPAsyncHandler<opts extends AMQPHandlerOpts> = (
  ctx: AMQPHandlerCtx<opts>
) => Promise<opts["returnType"]>;

export type AMQPFunction<opts extends AMQPHandlerOpts = AMQPHandlerOpts> =
  opts & {
    handler: AMQPHandler<opts>;
  };
