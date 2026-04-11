import "dotenv/config";
import { defineConfig } from "@prisma/config";

export default defineConfig({
  datasource: {
    // @ts-ignore
    url: process.env.DATABASE_URL,
  },
});