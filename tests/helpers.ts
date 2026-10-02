import { randomUUID } from "node:crypto";

export function createTestIdentity(): {
  name: string;
  email: string;
  password: string;
} {
  const id = randomUUID();
  return {
    name: `API-${id.slice(0, 12)}`,
    email: `api-test-${id}@example.com`,
    password: `T-${id.slice(0, 12)}-Pass9!`,
  };
}

export function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Expected the API response body to be an object");
  }
  return value as Record<string, unknown>;
}

export function nestedString(
  value: unknown,
  parentKey: string,
  key: string,
): string {
  const parent = asRecord(asRecord(value)[parentKey]);
  const result = parent[key];
  if (typeof result !== "string" || result.length === 0) {
    throw new Error(`Expected API response field "${parentKey}.${key}"`);
  }
  return result;
}

export function recordsField(
  value: unknown,
  key: string,
): Record<string, unknown>[] {
  const result = asRecord(value)[key];
  if (!Array.isArray(result)) {
    throw new Error(`Expected API response field "${key}" to be an array`);
  }
  return result.map(asRecord);
}
