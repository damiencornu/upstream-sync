import { initializeProviders } from "../../initializeProviders";

import { EmailImportService } from "../EmailImportService";

import { MessageRepository } from "../../datastore/repositories/MessageRepository";
import { ThreadRepository } from "../../datastore/repositories/ThreadRepository";

describe("EmailImportService", () => {
  let emailImportService: EmailImportService;
  let messageRepository: MessageRepository;
  let threadRepository: ThreadRepository;

  beforeAll(async () => {
    const providers = await initializeProviders();
    const databaseSchemaService = providers.databaseSchemaService;

    emailImportService = providers.emailImportService;
    messageRepository = providers.messageRepository;
    threadRepository = providers.threadRepository;

    await databaseSchemaService.resetDatabaseSchemaAndData();
  });

  describe("createThreadsFromEmails", () => {
    beforeAll(async () => {
      await emailImportService.import();
    });

    test("it creates threads", async () => {
      const threads = await threadRepository.findAll();

      // Correct number of threads created
      expect(threads).toHaveLength(5);
      // First thread has a specific name
      expect(threads.at(0)).toEqual({
        _id: 1,
        name: "Software Update Discussion",
      });
    });

    test("it associates messages", async () => {
      const messages = await messageRepository.findAll();

      // Has created all messages
      expect(messages).toHaveLength(14);

      // Correct messages associated to thread `1`
      const messagesFromThreadOne = messages.filter((m) => m.threadId === 1);
      expect(messagesFromThreadOne).toHaveLength(3);
      expect(messagesFromThreadOne.map((m) => m.emailId)).toEqual([1, 2, 8]);
    });
  });
});
