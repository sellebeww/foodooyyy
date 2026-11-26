// tests/setup.ts
import "fake-indexeddb/auto";
import { configure } from "@testing-library/react";

configure({ asyncUtilTimeout: 5_000 });
