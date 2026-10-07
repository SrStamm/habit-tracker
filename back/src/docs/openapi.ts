import type { OpenAPIObject } from "openapi3-ts/oas30";
import {
  OpenApiGeneratorV3,
  OpenAPIRegistry,
} from "@asteasolutions/zod-to-openapi";

export const registry = new OpenAPIRegistry();

export function buildDocument(): OpenAPIObject {
  return new OpenApiGeneratorV3(registry.definitions).generateDocument({
    openapi: "3.0.0",
    info: { title: "Habits Tracker API", version: "1.0.0" },
  });
}
