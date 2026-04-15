// tests/tasks.test.js
const request = require("supertest");
const app = require("../src/app");
const taskService = require("../src/services/taskService");

describe("Tasks API Integration Tests", () => {
  beforeEach(() => {
    // Reset in-memory store before each test so they don't pollute one another
    if (taskService._resetStore) taskService._resetStore();
  });

  it("should successfully create a new task", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ title: "Interview Assignment", priority: "high" });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("Interview Assignment");
    expect(res.body).toHaveProperty("id");
  });

  describe("Bug Fixes Verification", () => {
    it("should correctly paginate results based on query params", async () => {
      await request(app).post("/tasks").send({ title: "Task 1" });
      await request(app).post("/tasks").send({ title: "Task 2" });
      await request(app).post("/tasks").send({ title: "Task 3" });

      // Passing strings as query params to test the integer parsing fix
      const res = await request(app).get("/tasks?page=1&limit=2");
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
    });

    it("should ignore case-sensitivity on the status filter", async () => {
      await request(app).post("/tasks").send({ title: "Task 1" }); // Defaults to 'pending'

      const res = await request(app).get("/tasks?status=PENDING");
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].status).toBe("pending");
    });

    it("should preserve immutable fields during a PUT update", async () => {
      const createRes = await request(app)
        .post("/tasks")
        .send({ title: "Original Title" });
      const id = createRes.body.id;
      const originalDate = createRes.body.createdAt;

      const putRes = await request(app)
        .put(`/tasks/${id}`)
        .send({ title: "Updated Title" });
      expect(putRes.statusCode).toBe(200);
      expect(putRes.body.id).toBe(id); // Ensure ID is not overwritten
      expect(putRes.body.createdAt).toBe(originalDate); // Ensure creation date is intact
    });
  });

  describe("New Feature: PATCH /tasks/:id/assign", () => {
    it("should assign a task to a user successfully", async () => {
      const createRes = await request(app)
        .post("/tasks")
        .send({ title: "Task to Assign" });
      const id = createRes.body.id;

      const res = await request(app)
        .patch(`/tasks/${id}/assign`)
        .send({ assigneeId: "user-777" });
      expect(res.statusCode).toBe(200);
      expect(res.body.assigneeId).toBe("user-777");
    });

    it("should return 400 Bad Request if assigneeId is missing", async () => {
      const createRes = await request(app)
        .post("/tasks")
        .send({ title: "Task to Assign" });
      const id = createRes.body.id;

      const res = await request(app).patch(`/tasks/${id}/assign`).send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("assigneeId is required");
    });

    it("should return 404 Not Found if task ID does not exist", async () => {
      const res = await request(app)
        .patch("/tasks/9999/assign")
        .send({ assigneeId: "user-777" });
      expect(res.statusCode).toBe(404);
    });
  });
});
