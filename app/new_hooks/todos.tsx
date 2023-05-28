"use client";

import { useRouter } from "next/navigation";
import { experimental_useOptimistic, useRef } from "react";
import { experimental_useFormStatus } from "react-dom";
import { Todo } from "../api/route";

interface TodosProps {
  todos: Todo[];
}

export const Todos = ({ todos }: TodosProps) => {
  const [optimisticTodos, addOptimisticTodo] = experimental_useOptimistic<
    Todo[],
    Todo
  >(todos, (state, newTodo) => {
    return [...state, newTodo];
  });
  const ref = useRef<HTMLFormElement>(null);
  const router = useRouter();

  return (
    <>
      <form
        action={async (formData) => {
          const title = formData.get("title") as string;
          const optimisticTodo: Todo = {
            id: Math.random(),
            title,
            completed: false,
            __optimistic: true
          };
          addOptimisticTodo(optimisticTodo);

          ref.current?.reset();

          await new Promise((resolve) => {
            setTimeout(() => {
              resolve(undefined);
            }, 2_000);
          });

          await fetch("http://localhost:3000/api", {
            body: formData,
            method: "POST"
          });

          router.refresh();
        }}
        ref={ref}
      >
        <label htmlFor="title">Title</label>
        <br />
        <input type="text" name="title" id="title" required={true} />
        <br />
        <br />
        <Button />
      </form>
      <ul>
        {optimisticTodos.map((todo) => {
          return (
            <li
              style={{
                opacity: todo.__optimistic ? 0.5 : 1
              }}
              key={todo.id}
            >
              {todo.title}
            </li>
          );
        })}
      </ul>
    </>
  );
};

const Button = () => {
  const { pending } = experimental_useFormStatus();

  return <button disabled={pending}>Add</button>;
};
