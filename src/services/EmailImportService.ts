import { EmailRepository } from "../datastore/repositories/EmailRepository";
import { MessageRepository } from "../datastore/repositories/MessageRepository";
import { ThreadRepository } from "../datastore/repositories/ThreadRepository";
import { UserRepository } from "../datastore/repositories/UserRepository";
import { EmailEntity } from "../model/entities/EmailEntity";
import { MessageEntity } from "../model/entities/MessageEntity";
import { ThreadEntity } from "../model/entities/ThreadEntity";
import { EmailFetcherService } from "./EmailFetcherService";

export class EmailImportService {
  constructor(
    private readonly emailFetcherService: EmailFetcherService,
    private readonly emailRepository: EmailRepository,
    private readonly messageRepository: MessageRepository,
    private readonly threadRepository: ThreadRepository,
    private readonly userRepository: UserRepository,
  ) {}

  public async import(): Promise<void> {
    const fetchedEmails = await this.retrieveAndPersistEmails();
    const threads = await this.createThreadsFromEmails(fetchedEmails);
    const messages = await Promise.all(
      fetchedEmails.map((email) => this.createMessageFromEmail(email, threads)),
    );
    await this.messageRepository.persist(messages);
  }

  private async retrieveAndPersistEmails() {
    const fetchedEmails = await this.emailFetcherService.fetch();
    await this.emailRepository.persist(fetchedEmails);
    return fetchedEmails;
  }

  private async createThreadsFromEmails(emails: Array<EmailEntity>) {
    const threads = new Map<string, ThreadEntity>();

    for (const email of emails) {
      // Create thread for 1st email
      if (!email.inReplyTo) {
        const thread = await this.createThread(email);
        threads.set(email.universalMessageId.toString(), thread);
      }
      // Retrieve thread if replying to
      else {
        const thread = threads.get(email.inReplyTo.toString());
        threads.set(email.universalMessageId.toString(), thread!);
      }
    }

    return threads;
  }

  private async createThread(email: EmailEntity) {
    const singleThread = ThreadEntity.createFromEmail(email);
    await this.threadRepository.persist([singleThread]);
    return singleThread;
  }

  private async createMessageFromEmail(
    email: EmailEntity,
    threads: Map<string, ThreadEntity>,
  ): Promise<MessageEntity> {
    const user = await this.userRepository.findByEmail(email.from.email);
    const messageSenderId = user?.id ?? null;

    const thread = threads.get(email.universalMessageId.toString());
    if (!thread) {
      throw new Error(
        `Could not retrieve thread for ${email.universalMessageId.toString()}`,
      );
    }

    const message = MessageEntity.createFromEmail(
      messageSenderId,
      thread.id!,
      email,
    );
    return message;
  }
}
