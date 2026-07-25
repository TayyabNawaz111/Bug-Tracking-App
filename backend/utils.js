const DEFAULT_WEBHOOK_TIMEOUT_MS = 3000;

function normalizeIdList(input) {
  if (input == null) {
    return [];
  }

  if (Array.isArray(input)) {
    return input
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0);
  }

  const singleValue = Number(input);
  return Number.isInteger(singleValue) && singleValue > 0 ? [singleValue] : [];
}

function buildWebhookPayload(eventType, actorId, data) {
  return {
    event_type: eventType,
    timestamp: new Date().toISOString(),
    actor_id: actorId ?? null,
    data: data ?? {},
  };
}

function getWebhookTargets() {
  const rawTargets = process.env.WEBHOOK_URL || process.env.WEBHOOK_URLS || "";
  return rawTargets
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

async function dispatchWebhookEvent(payload, targets = getWebhookTargets()) {
  if (!targets.length) {
    return;
  }

  const requests = targets.map((url) => dispatchSingleWebhook(url, payload));
  await Promise.allSettled(requests);
}

async function dispatchSingleWebhook(url, payload) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_WEBHOOK_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Webhook responded with ${response.status}`);
    }
  } catch (error) {
    console.warn(`Webhook delivery failed for ${url}:`, error.message);
  } finally {
    clearTimeout(timeoutId);
  }
}

function createErrorResponse(res, status, message, error) {
  const response = { message };

  if (error) {
    response.error = error.message || String(error);
  }

  return res.status(status).json(response);
}

module.exports = {
  normalizeIdList,
  buildWebhookPayload,
  dispatchWebhookEvent,
  createErrorResponse,
};
