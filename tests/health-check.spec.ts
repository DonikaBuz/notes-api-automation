import { ApiClient } from "../src/api-client";
import { asRecord } from "./helpers";

describe("health check", () => {
  it("reports that the Notes API is running", async () => {
    const response = await new ApiClient().get("/health-check");

    expect(response.status).toBe(200);
    expect(asRecord(response.body)).toMatchObject({
      success: true,
      status: 200,
    });
  });
});
