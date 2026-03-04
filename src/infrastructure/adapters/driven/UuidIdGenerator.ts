import crypto from "crypto";
import type { IIdGenerator } from "@port/driven/IIdGenerator.js";

export class UuidIdGenerator implements IIdGenerator {
  generate(): string {
    return crypto.randomUUID();
  }
}