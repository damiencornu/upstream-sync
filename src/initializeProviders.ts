import { EmailRepository } from "./datastore/repositories/EmailRepository";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { DatabaseSchemaService } from "./services/DatabaseSchemaService";
import { EmailImportService } from "./services/EmailImportService";
import { EmailFetcherService } from "./services/EmailFetcherService";
import { MessageRepository } from "./datastore/repositories/MessageRepository";
import { ThreadRepository } from "./datastore/repositories/ThreadRepository";
import { UserRepository } from "./datastore/repositories/UserRepository";
import { MessageDisplayService } from "./services/MessageDisplayService";

export async function initializeProviders() {
  const database = await open({
    filename: process.env.SQLITE_DB || "./db.sqlite",
    driver: sqlite3.Database,
  });

  const emailRepository = new EmailRepository(database);
  const databaseSchemaService = new DatabaseSchemaService(database);
  const emailFetcherService = new EmailFetcherService();
  const messageRepository = new MessageRepository(database);
  const threadRepository = new ThreadRepository(database);
  const userRepository = new UserRepository(database);
  const emailImportService = new EmailImportService(
    emailFetcherService,
    emailRepository,
    messageRepository,
    threadRepository,
    userRepository,
  );
  const messageDisplayService = new MessageDisplayService(
    messageRepository,
    threadRepository,
    userRepository,
    emailRepository,
  );

  const providers = {
    emailRepository,
    databaseSchemaService,
    emailFetcherService,
    emailImportService,
    messageRepository,
    threadRepository,
    userRepository,
    messageDisplayService,
  };

  return providers;
}
