# Full Stack Developer Intern Assessment - Submission Notes

Thank you for the opportunity to work on this assessment! Below is a summary of the bugs I identified and fixed, the new feature I implemented, and the testing strategy I applied to the `task-api`.

## 1. Bug Fixes

During my initial review and testing of the API, I identified three primary bugs related to data handling and in-memory state mutation.

### Bug 1: Pagination Logic Failure (`GET /tasks`)
* **Location:** `services/taskService.js`
* **The Issue:** The `page` and `limit` query parameters were being read as strings from the request URL. When used directly in mathematical operations to calculate the `startIndex` and `endIndex` for array slicing, it resulted in improper data chunking.
* **The Fix:** I updated the logic to safely parse both parameters into Base-10 integers (`parseInt(val, 10)`), with fallbacks to defaults, ensuring the `slice()` method receives valid numbers.

### Bug 2: Case-Sensitive Status Filtering (`GET /tasks`)
* **Location:** `services/taskService.js`
* **The Issue:** The `?status=` query filter was strictly checking for exact string matches. If a user passed `?status=PENDING` but the task was stored as `pending`, the filter failed to return the valid task.
* **The Fix:** I normalized both the query parameter and the task's stored status by converting them to lowercase before performing the equality check.

### Bug 3: Destructive Updates (`PUT /tasks/:id`)
* **Location:** `services/taskService.js`
* **The Issue:** The `PUT` endpoint was destructively replacing the existing task object with the incoming request body. This caused persistent, immutable fields like `id` and `createdAt` to be deleted if they weren't explicitly included in the request payload.
* **The Fix:** I updated the `updateTask` method to merge the existing object with the new object, explicitly protecting the `id` and `createdAt` keys and refreshing the `updatedAt` timestamp.

---

## 2. New Feature: Assign a Task

**Endpoint:** `PATCH /tasks/:id/assign`

I implemented a new endpoint to assign tasks to specific users. I chose the `PATCH` HTTP method over `PUT` because assigning a user is a partial update to the task resource, rather than a full replacement.

**Design Decisions:**
* **Validation:** The route actively checks for the presence of an `assigneeId` in the request body. If it is missing, the API returns a `400 Bad Request` to prevent bad data from polluting the store.
* **Edge Cases:** If the provided task ID does not exist, it returns a standard `404 Not Found`.
* **State Management:** When successfully assigned, the task's `updatedAt` field is automatically refreshed.

---

## 3. Testing

I introduced a comprehensive test suite covering the standard API endpoints, verification for all three patched bugs, and edge cases for the new feature. To run the tests locally, run `npm test`.