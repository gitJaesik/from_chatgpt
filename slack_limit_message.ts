const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/your/webhook/url';
const MAX_PAYLOAD_SIZE = 50000; // Approximate Slack payload size limit
const MAX_TEXT_LENGTH = 3000;   // Conservative text size limit for Slack

// Function to send a message using fetch
async function sendSlackMessage(message: any): Promise<void> {
  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Slack API responded with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error sending message to Slack:', error);
  }
}

// Function to estimate payload size
function estimatePayloadSize(payload: any): number {
  return new TextEncoder().encode(JSON.stringify(payload)).length;
}

// Function to truncate text if it exceeds the allowed length
function truncateText(text: string, maxLength: number): string {
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

// Function to send message only with the first part if payload size exceeds limit
async function sendSlackMessageWithLimit(text: string, blocks: any[]): Promise<void> {
  let payload = { text, blocks };

  // Estimate the payload size
  let payloadSize = estimatePayloadSize(payload);

  // Check if the payload size exceeds the limit
  if (payloadSize > MAX_PAYLOAD_SIZE) {
    console.warn(`Payload exceeds Slack's limit of ${MAX_PAYLOAD_SIZE} bytes, sending truncated message.`);

    // Truncate text if necessary
    const truncatedText = truncateText(text, MAX_TEXT_LENGTH);

    // Send only the first block (if blocks exist)
    const truncatedBlocks = blocks.length > 0 ? [blocks[0]] : [];

    // Create a new payload with truncated content
    payload = { text: truncatedText, blocks: truncatedBlocks };

    // Recalculate the payload size to ensure it's within the limit
    payloadSize = estimatePayloadSize(payload);

    if (payloadSize > MAX_PAYLOAD_SIZE) {
      console.error('Truncated message still exceeds Slack payload limit.');
      return;
    }
  }

  // Send the truncated or original message
  await sendSlackMessage(payload);
}

// Example usage
const largeText = "A large message that potentially exceeds Slack's limit...";
const blocks = [
  {
    type: "section",
    text: { type: "mrkdwn", text: "This is the first block." }
  },
  {
    type: "section",
    text: { type: "mrkdwn", text: "This is the second block that might not be sent if the payload exceeds the limit." }
  }
];

// Send the message with the truncation logic
sendSlackMessageWithLimit(largeText, blocks);
