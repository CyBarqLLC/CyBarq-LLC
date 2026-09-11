import { z } from "zod";
import { optionalString, requiredString } from "./common";

const roleKey = z.string().trim().regex(/^[a-z_]{2,40}$/);

/** Roles arrive as repeated checkbox values (string or string[]) or omitted entirely. */
export const roleList = z.preprocess((v) => (v === undefined ? [] : Array.isArray(v) ? v : [v]), z.array(roleKey).max(20));

export const inviteEmployeeSchema = z.object({
  email: z.string().trim().email().max(200),
  full_name: requiredString(200),
  full_name_ar: optionalString(200),
  roles: roleList,
});

export const userRolesSchema = z.object({
  roles: roleList,
});

export const rolePermissionSchema = z.object({
  role_key: roleKey,
  permission_key: z.string().trim().regex(/^[a-z_]+\.[a-z_]+$/),
  granted: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean()),
});
