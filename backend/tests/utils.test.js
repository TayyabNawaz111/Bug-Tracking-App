const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeIdList, buildWebhookPayload } = require("../utils");

test("normalizeIdList converts mixed values into a clean numeric array", () => {
  assert.deepEqual(normalizeIdList([1, "2", 3, "abc"]), [1, 2, 3]);
  assert.deepEqual(normalizeIdList(null), []);
  assert.deepEqual(normalizeIdList("4"), [4]);
});

test("buildWebhookPayload includes the required metadata", () => {
  const payload = buildWebhookPayload("ticket.created", 7, { id: 12 });

  assert.equal(payload.event_type, "ticket.created");
  assert.equal(payload.actor_id, 7);
  assert.deepEqual(payload.data, { id: 12 });
  assert.match(payload.timestamp, /\d{4}-\d{2}-\d{2}T/);
});
