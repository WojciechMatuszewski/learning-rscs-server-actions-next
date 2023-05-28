import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export interface Todo {
  id: number;
  title: string;
  completed: boolean;

  __optimistic?: boolean;
}

const todos: Todo[] = [
  {
    id: 1,
    title: "Static todo",
    completed: false
  }
];

export async function POST(request: Request) {
  const body = await request.formData();
  const todo: Todo = {
    completed: false,
    id: Math.random(),
    title: body.get("title") as string
  };
  todos.push(todo);

  return NextResponse.json(todo);
}

export async function GET() {
  return NextResponse.json(todos);
}
