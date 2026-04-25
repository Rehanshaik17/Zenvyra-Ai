/**
 * Zenyvra AI Agent — Tool Definitions & Mock Implementations
 *
 * Defines all the Gemini function-calling tool schemas and their
 * corresponding mock handler functions. Each tool returns a simulated
 * success response so the agent's conversational flow can be tested
 * end-to-end before connecting real APIs.
 */

import { Type } from '@google/genai';

// ─── Tool Schema Definitions for Gemini ────────────────────────────

export const agentToolDeclarations = [
  {
    name: 'createCalendarEvent',
    description: 'Create a new calendar event or meeting. Use when the user wants to schedule something.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'Title of the event' },
        startTime: { type: Type.STRING, description: 'Start time in ISO 8601 format (e.g., 2026-04-26T17:00:00)' },
        endTime: { type: Type.STRING, description: 'End time in ISO 8601 format (e.g., 2026-04-26T18:00:00)' },
        attendees: { type: Type.STRING, description: 'Comma-separated list of attendee names or emails' },
      },
      required: ['title', 'startTime'],
    },
  },
  {
    name: 'updateCalendarEvent',
    description: 'Update/reschedule an existing calendar event.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        eventId: { type: Type.STRING, description: 'The ID of the event to update' },
        newTitle: { type: Type.STRING, description: 'New title for the event (optional)' },
        newStartTime: { type: Type.STRING, description: 'New start time in ISO 8601 format' },
        newEndTime: { type: Type.STRING, description: 'New end time in ISO 8601 format' },
      },
      required: ['eventId'],
    },
  },
  {
    name: 'deleteCalendarEvent',
    description: 'Delete/cancel a calendar event.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        eventId: { type: Type.STRING, description: 'The ID of the event to delete' },
      },
      required: ['eventId'],
    },
  },
  {
    name: 'setReminder',
    description: 'Set a reminder for a specific time.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        message: { type: Type.STRING, description: 'The reminder message' },
        time: { type: Type.STRING, description: 'When to trigger the reminder (ISO 8601 format)' },
      },
      required: ['message', 'time'],
    },
  },
  {
    name: 'sendMessage',
    description: 'Send a message to a contact via SMS, WhatsApp, or email.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        to: { type: Type.STRING, description: 'Recipient name, phone number, or email' },
        body: { type: Type.STRING, description: 'The message content' },
        channel: { type: Type.STRING, description: 'Channel: sms, whatsapp, or email' },
      },
      required: ['to', 'body'],
    },
  },
  {
    name: 'initiateCall',
    description: 'Initiate a phone or video call.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        contact: { type: Type.STRING, description: 'Name or phone number to call' },
        type: { type: Type.STRING, description: 'Call type: phone or video' },
      },
      required: ['contact'],
    },
  },
  {
    name: 'googleSearch',
    description: 'Search the web for real-time information. Use for any factual or current-event queries.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'The search query' },
      },
      required: ['query'],
    },
  },
  {
    name: 'placeOrder',
    description: 'Place an order for food, products, or services.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        item: { type: Type.STRING, description: 'What to order' },
        quantity: { type: Type.STRING, description: 'How many' },
        deliveryAddress: { type: Type.STRING, description: 'Delivery address if applicable' },
      },
      required: ['item'],
    },
  },
  {
    name: 'bookService',
    description: 'Book a service, appointment, or reservation.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        service: { type: Type.STRING, description: 'The service to book (e.g., restaurant, hotel, doctor)' },
        dateTime: { type: Type.STRING, description: 'Date/time for the booking (ISO 8601)' },
        details: { type: Type.STRING, description: 'Additional details (number of guests, preferences, etc.)' },
      },
      required: ['service'],
    },
  },
  {
    name: 'getDirections',
    description: 'Get directions or navigation info between locations.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        from: { type: Type.STRING, description: 'Starting location' },
        to: { type: Type.STRING, description: 'Destination' },
        mode: { type: Type.STRING, description: 'Travel mode: driving, walking, transit, or cycling' },
      },
      required: ['to'],
    },
  },
  {
    name: 'checkStatus',
    description: 'Check the status of a task, delivery, order, or any tracked item.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        trackingId: { type: Type.STRING, description: 'Tracking or order ID' },
        type: { type: Type.STRING, description: 'Type of item to check: order, delivery, task' },
      },
      required: ['trackingId'],
    },
  },
  {
    name: 'manageTask',
    description: 'Create, update, or complete a task in a to-do list.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        action: { type: Type.STRING, description: 'Action: create, update, complete, delete' },
        title: { type: Type.STRING, description: 'Task title' },
        taskId: { type: Type.STRING, description: 'Task ID (for update/complete/delete)' },
        dueDate: { type: Type.STRING, description: 'Due date (ISO 8601)' },
        priority: { type: Type.STRING, description: 'Priority: low, medium, high' },
      },
      required: ['action', 'title'],
    },
  },
];


// ─── Mock Tool Handlers ───────────────────────────────────────────

function generateId(): string {
  return 'evt_' + Math.random().toString(36).substring(2, 10);
}

const toolHandlers: Record<string, (args: Record<string, string>) => Record<string, unknown>> = {
  createCalendarEvent: (args) => ({
    success: true,
    eventId: generateId(),
    message: `Calendar event "${args.title}" has been created successfully.`,
    startTime: args.startTime,
    endTime: args.endTime || 'Not specified',
    attendees: args.attendees || 'None',
  }),

  updateCalendarEvent: (args) => ({
    success: true,
    eventId: args.eventId,
    message: `Event ${args.eventId} has been updated successfully.`,
    newStartTime: args.newStartTime || 'unchanged',
    newEndTime: args.newEndTime || 'unchanged',
  }),

  deleteCalendarEvent: (args) => ({
    success: true,
    eventId: args.eventId,
    message: `Event ${args.eventId} has been cancelled and removed from your calendar.`,
  }),

  setReminder: (args) => ({
    success: true,
    reminderId: generateId(),
    message: `Reminder set: "${args.message}" at ${args.time}.`,
  }),

  sendMessage: (args) => ({
    success: true,
    messageId: generateId(),
    message: `Message sent to ${args.to} via ${args.channel || 'default channel'}.`,
  }),

  initiateCall: (args) => ({
    success: true,
    callId: generateId(),
    message: `Initiating ${args.type || 'phone'} call to ${args.contact}...`,
  }),

  googleSearch: (args) => ({
    success: true,
    query: args.query,
    results: [
      { title: `Top result for: ${args.query}`, snippet: 'This is a simulated search result. Connect a real search API for live data.' },
      { title: `Related: ${args.query} guide`, snippet: 'Another simulated search result with relevant information.' },
    ],
    message: `Found results for "${args.query}".`,
  }),

  placeOrder: (args) => ({
    success: true,
    orderId: generateId(),
    message: `Order placed: ${args.quantity || '1'}x ${args.item}. Estimated delivery: 30-45 minutes.`,
    deliveryAddress: args.deliveryAddress || 'Default address',
  }),

  bookService: (args) => ({
    success: true,
    bookingId: generateId(),
    message: `Booking confirmed for ${args.service} on ${args.dateTime || 'requested date'}.`,
    details: args.details || 'No additional details',
  }),

  getDirections: (args) => ({
    success: true,
    from: args.from || 'Your current location',
    to: args.to,
    mode: args.mode || 'driving',
    estimatedTime: '25 minutes',
    distance: '12.5 km',
    message: `Directions to ${args.to}: Estimated ${args.mode || 'driving'} time is about 25 minutes (12.5 km).`,
  }),

  checkStatus: (args) => ({
    success: true,
    trackingId: args.trackingId,
    type: args.type || 'order',
    status: 'In Progress',
    lastUpdate: new Date().toISOString(),
    message: `Status of ${args.type || 'item'} ${args.trackingId}: In Progress. Last updated just now.`,
  }),

  manageTask: (args) => ({
    success: true,
    taskId: args.taskId || generateId(),
    action: args.action,
    message: `Task "${args.title}" has been ${args.action}d successfully.`,
    dueDate: args.dueDate || 'No due date',
    priority: args.priority || 'medium',
  }),
};


/**
 * Execute a tool by name with the given arguments.
 * Returns the mock result object.
 */
export function executeAgentTool(
  toolName: string,
  args: Record<string, string>
): Record<string, unknown> {
  const handler = toolHandlers[toolName];
  if (!handler) {
    return { success: false, error: `Unknown tool: ${toolName}` };
  }
  console.log(`[Agent Tool] Executing: ${toolName}`, args);
  return handler(args);
}
