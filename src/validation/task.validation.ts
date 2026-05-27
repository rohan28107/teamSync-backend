import { z } from "zod";
import { TaskPriorityEnum, TaskStatusEnum, TaskTypeEnum } from "../enums/task.enum";

export const titleSchema = z.string().trim().min(1).max(255);
export const descriptionSchema = z.string().trim().optional();

export const assignedToSchema = z.string().trim().min(1).nullable().optional();

export const assignedBySchema = z
  .string()
  .trim()
  .min(1)
  .nullable()
  .optional();

export const prioritySchema = z.enum(
  Object.values(TaskPriorityEnum) as [string, ...string[]]
);

export const statusSchema = z.enum(
  Object.values(TaskStatusEnum) as [string, ...string[]]
);

export const typeSchema = z.enum(
  Object.values(TaskTypeEnum) as [string, ...string[]]
);

export const urlArraySchema = z
  .array(z.string().trim().url())
  .optional();

export const dateSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (val) => {
      return !val || !isNaN(Date.parse(val));
    },
    {
      message: "Invalid date format. Please provide a valid date string.",
    }
  );

export const iterationSchema = z
  .string()
  .trim()
  .max(100)
  .optional();

export const taskIdSchema = z.string().trim().min(1);

export const createTaskSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  priority: prioritySchema,
  status: statusSchema,
  assignedTo: assignedToSchema,
  assignedBy: assignedBySchema,
  figmaLinks: urlArraySchema,
  jiraLinks: urlArraySchema,
  prLinks: urlArraySchema,
  startDate: dateSchema,
  iteration: iterationSchema,
  dueDate: dateSchema,
});

export const updateTaskSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  priority: prioritySchema,
  status: statusSchema,
  assignedTo: assignedToSchema,
  assignedBy: assignedBySchema,
  figmaLinks: urlArraySchema,
  jiraLinks: urlArraySchema,
  prLinks: urlArraySchema,
  startDate: dateSchema,
  dueDate: dateSchema,
  iteration: iterationSchema,
});