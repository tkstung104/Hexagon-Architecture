import crypto from "crypto";
import type { IIdGenerator } from "@port/driven/IIdGenerator.js";

export class UuidIdGenerator implements IIdGenerator {
  async generate(): Promise<string> {
    return crypto.randomUUID();
  }
}