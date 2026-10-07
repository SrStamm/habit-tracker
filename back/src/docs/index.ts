import { registerAuthDocs } from "../modules/auth/auth.docs";
import { registerEntryDocs } from "../modules/entry/entry.docs";
import { registerHabitDocs } from "../modules/habit/habit.docs";
import { registry } from "./openapi";

registerAuthDocs(registry);
registerHabitDocs(registry);
registerEntryDocs(registry);
