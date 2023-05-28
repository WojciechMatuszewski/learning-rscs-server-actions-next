import Page, { createTodo } from "../page";
import { it, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";
import { setupServer } from "msw/node";
import { rest } from "msw";

import { render, screen } from "@testing-library/react";

vi.mock("next/cache", () => {
  return {
    ...vi.importActual("next/cache"),
    revalidatePath: vi.fn()
  };
});

const server = setupServer();

beforeAll(() => {
  server.listen();
});

afterAll(() => {
  server.close();
});

beforeEach(() => {
  server.resetHandlers();
});

it("posts the data", async () => {
  server.use(
    rest.post("http://localhost:3000/api", async (req, res, ctx) => {
      /**
       * Mind that we are sending a FormData here.
       * There is no native way to handle it. MSW will include appropriate functions in v2.
       */
      const body = await req.body;
      expect(body).toEqual({ title: "TEST_TITLE" });

      return res(ctx.status(200));
    })
  );

  const data = new FormData();
  data.append("title", "TEST_TITLE");
  const response = await createTodo(data);

  expect(response).toBeUndefined();
});

it("renders the JSX", async () => {
  server.use(
    rest.get("http://localhost:3000/api", (req, res, ctx) => {
      return res.once(
        ctx.json([
          { id: 1, title: "test1" },
          { id: 2, title: "test2" }
        ])
      );
    })
  );

  const page = await Page();
  render(page);

  expect(screen.getAllByRole("listitem")).toHaveLength(2);
});
