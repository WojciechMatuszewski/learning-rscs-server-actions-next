import { revalidatePath } from "next/cache";
import { Todo } from "./api/route";
import { Form } from "./form";
import Link from "next/link";

export async function createTodo(formData: FormData) {
  "use server";

  await fetch("http://localhost:3000/api", {
    body: formData,
    method: "POST"
  });

  revalidatePath("/");
}

export default async function Home() {
  const todosResponse = await fetch("http://localhost:3000/api", {
    method: "GET"
  });

  const todos: Todo[] = await todosResponse.json();

  return (
    <>
      <section>
        <Link href="/new_hooks">New hooks</Link>
      </section>
      <section>
        <h2>Add todo</h2>
        <form action={createTodo}>
          <label htmlFor="title">Title</label>
          <br />
          <input type="text" name="title" id="title" required={true} />
          <br />
          <br />
          <button type="submit">Add</button>
        </form>
      </section>
      <hr />
      <section>
        <h2>Todos</h2>
        <ul>
          {todos.map((todo) => {
            return <li key={todo.id}>{todo.title}</li>;
          })}
        </ul>
      </section>
    </>
  );
}
