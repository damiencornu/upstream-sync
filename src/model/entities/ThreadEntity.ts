import { AbstractEntity } from "./AbstractEntity";
import { EmailEntity } from "./EmailEntity";

export class ThreadEntity extends AbstractEntity {
  constructor(
    public readonly name: string,
    id?: number,
  ) {
    super(id);
  }

  public static createFromEmail(email: EmailEntity): ThreadEntity {
    return new ThreadEntity(email.subject);
  }
}
