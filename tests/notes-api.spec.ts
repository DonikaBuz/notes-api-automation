import { ApiClient } from "../src/api-client";
import {
  asRecord,
  createTestIdentity,
  nestedString,
  recordsField,
} from "./helpers";

describe("authenticated notes workflow", () => {
  const api = new ApiClient();
  const identity = createTestIdentity();
  let token: string | undefined;
  let accountRegistered = false;

  it("registers a unique user and logs in successfully", async () => {
    const registration = await api.post("/users/register", identity);
    accountRegistered = registration.status === 201;
    expect(registration.status).toBe(201);

    const login = await api.post("/users/login", {
      email: identity.email,
      password: identity.password,
    });
    expect(login.status).toBe(200);
    token = nestedString(login.body, "data", "token");
  });

  afterAll(async () => {
    if (!accountRegistered) {
      return;
    }

    if (!token) {
      const login = await api.post("/users/login", {
        email: identity.email,
        password: identity.password,
      });
      expect(login.status).toBe(200);
      token = nestedString(login.body, "data", "token");
    }

    const deletion = await api.delete("/users/delete-account", token);
    expect(deletion.status).toBe(200);
  });

  it("retrieves the authenticated user's profile", async () => {
    const response = await api.get("/users/profile", token);

    expect(response.status).toBe(200);
    expect(asRecord(response.body)).toMatchObject({ success: true });
    expect(nestedString(response.body, "data", "email")).toBe(identity.email);
  });

  it("creates, reads, lists, and deletes its own note", async () => {
    const initialNote = {
      title: `API automation ${Date.now()}`,
      description: "Disposable note created by the API automation suite.",
      category: "Personal",
    };
    const creation = await api.post("/notes", initialNote, token);
    expect(creation.status).toBe(200);
    const noteId = nestedString(creation.body, "data", "id");

    const read = await api.get(`/notes/${noteId}`, token);
    expect(read.status).toBe(200);
    expect(asRecord(read.body)).toMatchObject({
      data: { id: noteId, title: initialNote.title },
    });

    const list = await api.get("/notes", token);
    expect(list.status).toBe(200);
    const listedNotes = recordsField(list.body, "data");
    expect(listedNotes).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: noteId })]),
    );

    const deletion = await api.delete(`/notes/${noteId}`, token);
    expect(deletion.status).toBe(200);
  });

  it("rejects access to notes without an authentication token", async () => {
    const response = await api.get("/notes");

    expect(response.status).toBe(401);
  });

  it("rejects login with an unknown email and password", async () => {
    const response = await api.post("/users/login", {
      email: `missing-${identity.email}`,
      password: identity.password,
    });

    expect(response.status).toBe(401);
  });
});
