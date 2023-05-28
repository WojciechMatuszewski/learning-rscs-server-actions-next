import { Todo } from "../api/route";
import { Todos } from "./todos";

export default async function Page() {
  const todosResponse = await fetch("http://localhost:3000/api", {
    method: "GET"
  });
  const todos: Todo[] = await todosResponse.json();

  return <Todos todos={todos} />;
}
