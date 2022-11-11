export interface ICRUDL<
  Type,
  CreateTypeDto = Type,
  UpdateTypeDto = CreateTypeDto
> {
  create(value: CreateTypeDto): string;
  read(id: string): Type;
  update(id: string, value: UpdateTypeDto): Type;
  delete(id: string): string;
  list(): string[];
}

export class TModel<T> implements ICRUDL<T> {
  private readonly state: Record<string, T> = {};

  constructor() {}

  create(value: T): string {
    const id = crypto.randomUUID();
    this.state[id] = value;
    return id;
  }
  read(id: string): T {
    return this.state[id];
  }
  update(id: string, value: T): T {
    return (this.state[id] = value);
  }
  delete(id: string): string {
    delete this.state[id];
    return id;
  }
  list(): string[] {
    return Object.keys(this.state);
  }
}
