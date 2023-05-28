"use client";

import { useRouter } from "next/navigation";

export const Form = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();

        await fetch("http://localhost:3000/api", {
          method: "POST",
          body: new FormData(event.currentTarget)
        });

        (event.target as HTMLFormElement).reset();

        router.refresh();
      }}
    >
      {children}
    </form>
  );
};
