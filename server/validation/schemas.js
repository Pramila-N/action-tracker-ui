const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid ObjectId.');

const roleSchema = z.enum(['admin', 'faculty', 'student']);
const prioritySchema = z.enum(['low', 'medium', 'high']);

const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: roleSchema,
});

const registerBodySchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(6),
  role: roleSchema,
});

const usersQuerySchema = z.object({
  role: roleSchema.optional(),
});

const notificationListQuerySchema = z.object({
  userId: objectIdSchema.optional(),
});

const markAllReadBodySchema = z.object({
  userId: objectIdSchema.optional(),
});

const taskIdParamSchema = z.object({
  id: objectIdSchema,
});

const taskCreateBodySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  assignedTo: z.union([objectIdSchema, z.array(objectIdSchema).min(1)]),
  priority: prioritySchema,
  deadline: z.coerce.date(),
  createdBy: objectIdSchema.optional(),
});

const taskUpdateBodySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(5000).optional(),
  assignedTo: objectIdSchema.optional(),
  priority: prioritySchema.optional(),
  deadline: z.coerce.date().optional(),
  status: z.enum(['pending', 'in_progress', 'submitted', 'rework_required', 'late_rework_required', 'completed', 'completed_late_rework', 'overdue']).optional(),
  progress: z.number().min(0).max(100).optional(),
  timeSpent: z.number().min(0).optional(),
  userId: objectIdSchema.optional(),
});

const taskListQuerySchema = z.object({
  assignedTo: objectIdSchema.optional(),
  createdBy: objectIdSchema.optional(),
});

const leaderboardQuerySchema = z.object({
  createdBy: objectIdSchema.optional(),
});

const forumTaskParamSchema = z.object({
  taskId: objectIdSchema,
});

const forumStatusQuerySchema = z.object({
  userId: objectIdSchema.optional(),
});

const forumMessageBodySchema = z.object({
  taskId: objectIdSchema,
  senderId: objectIdSchema.optional(),
  message: z.string().min(1).max(2000),
});

module.exports = {
  loginBodySchema,
  registerBodySchema,
  usersQuerySchema,
  notificationListQuerySchema,
  markAllReadBodySchema,
  taskIdParamSchema,
  taskCreateBodySchema,
  taskUpdateBodySchema,
  taskListQuerySchema,
  leaderboardQuerySchema,
  forumTaskParamSchema,
  forumStatusQuerySchema,
  forumMessageBodySchema,
};
