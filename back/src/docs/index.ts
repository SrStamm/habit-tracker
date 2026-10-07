import { registerAuthDocs } from "../modules/auth/auth.docs";
import { registerHabitDocs } from "../modules/habit/habit.docs";
import { registry } from "./openapi";

registerAuthDocs(registry);
registerHabitDocs(registry);
