import { ParsedMessage } from "../../types/mqtt";

export const parseMessage = (message: string): ParsedMessage | null => {
  try {
    const parsed = JSON.parse(message);
    if (parsed.message && typeof parsed.message === "string") {
      return {
        message: parsed.message,
        timestamp: parsed.timestamp || new Date().toISOString()
      };
    }
    return null;
  } catch {
    return null;
  }
};

export const filterValidMessages = (messages: string[]): string[] => {
  return messages
    .map(message => parseMessage(message))
    .filter((parsed): parsed is ParsedMessage => parsed !== null)
    .map(parsed => parsed.message);
};

describe("Message Parser Utils", () => {
  describe("parseMessage", () => {
    it("should parse valid JSON message", () => {
      const validMessage = JSON.stringify({
        message: "Hello World",
        timestamp: "2023-01-01T00:00:00Z"
      });

      const result = parseMessage(validMessage);

      expect(result).toEqual({
        message: "Hello World",
        timestamp: "2023-01-01T00:00:00Z"
      });
    });

    it("should return null for invalid JSON", () => {
      const invalidMessage = "Invalid JSON message";

      const result = parseMessage(invalidMessage);

      expect(result).toBeNull();
    });

    it("should return null for JSON without message property", () => {
      const messageWithoutText = JSON.stringify({
        timestamp: "2023-01-01T00:00:00Z"
      });

      const result = parseMessage(messageWithoutText);

      expect(result).toBeNull();
    });

    it("should return null for JSON with non-string message", () => {
      const messageWithNonString = JSON.stringify({
        message: 123,
        timestamp: "2023-01-01T00:00:00Z"
      });

      const result = parseMessage(messageWithNonString);

      expect(result).toBeNull();
    });

    it("should add default timestamp if not provided", () => {
      const messageWithoutTimestamp = JSON.stringify({
        message: "Hello World"
      });

      const result = parseMessage(messageWithoutTimestamp);

      expect(result).toHaveProperty("message", "Hello World");
      expect(result).toHaveProperty("timestamp");
      expect(typeof result?.timestamp).toBe("string");
    });
  });

  describe("filterValidMessages", () => {
    it("should filter and return only valid messages", () => {
      const messages = [
        JSON.stringify({ message: "Valid 1", timestamp: "2023-01-01T00:00:00Z" }),
        "Invalid JSON",
        JSON.stringify({ message: "Valid 2", timestamp: "2023-01-01T00:01:00Z" }),
        JSON.stringify({ timestamp: "2023-01-01T00:02:00Z" }), // No message property
        JSON.stringify({ message: "Valid 3" }) // No timestamp
      ];

      const result = filterValidMessages(messages);

      expect(result).toEqual(["Valid 1", "Valid 2", "Valid 3"]);
    });

    it("should return empty array for all invalid messages", () => {
      const messages = ["Invalid JSON 1", "Invalid JSON 2", JSON.stringify({ timestamp: "2023-01-01T00:00:00Z" })];

      const result = filterValidMessages(messages);

      expect(result).toEqual([]);
    });

    it("should return all messages for all valid messages", () => {
      const messages = [
        JSON.stringify({ message: "Valid 1", timestamp: "2023-01-01T00:00:00Z" }),
        JSON.stringify({ message: "Valid 2", timestamp: "2023-01-01T00:01:00Z" }),
        JSON.stringify({ message: "Valid 3", timestamp: "2023-01-01T00:02:00Z" })
      ];

      const result = filterValidMessages(messages);

      expect(result).toEqual(["Valid 1", "Valid 2", "Valid 3"]);
    });

    it("should handle empty array", () => {
      const messages: string[] = [];

      const result = filterValidMessages(messages);

      expect(result).toEqual([]);
    });
  });
});
