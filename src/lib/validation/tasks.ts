import { z } from "zod";
import { optionalDate, optionalString, optionalUuid, requiredString } from "./common";

export const TASK_STATUSES = ["todo", "in_progress", "review", "done", "cancelled"] as const;
export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export const OPEN_TASK_STATUSES = ["todo", "in_progress", "review"] as const;

export const taskStatusEnum = z.enum(TASK_STATUSES);
export const taskPriorityEnum = z.enum(TASK_PRIORITIES);

export const taskSchema = z.object({
  title: requiredString(200),
  description: optionalString(5000),
  status: taskStatusEnum,
  priority: taskPriorityEnum,
  assignee_user_id: optionalUuid,
  milestone_id: optionalUuid,
  due_date: optionalDate,
});

export type TaskInput = z.infer<typeof taskSchema>;

export const taskStatusSchema = z.object({ status: taskStatusEnum });

export const commentSchema = z.object({ body: requiredString(5000) });

export function isTaskStatus(value: string | undefined): value is (typeof TASK_STATUSES)[number] {
  return (TASK_STATUSES as readonly string[]).includes(value ?? "");
}
