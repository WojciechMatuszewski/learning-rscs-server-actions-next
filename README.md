# Playing around with RSCs and Server Actions

## What I've learned

- There is a **difference in behavior when calling the [_Route Handlers_](https://nextjs.org/docs/app/building-your-application/routing/router-handlers) on the server or on the client**.

  - If you make the request on the server (for example in a RSC), the URL has to be absolute.

    - Instead of `/api`, you have to provide the full path, like so: `http://localhost:3000/api`.

  - If you make the request on the client (for example in `useEffect`), the URL can be relative.

  - This difference tripped me up as I though I'm doing something wrong with file structure. TBH I'm not sure why is that the case. Maybe on the client, the framework has more information about the _Route Handlers_ address?

- **Next.js will INFER, based on how you defined your route handler, if it should use the cache or not**.

  - This seems quite magical to me. I'm not sure I like it.

  - Of course, there is a way to bail out of this behavior and force the framework to always use static or dynamic data-fetching.

- Keep in mind that **the native HTML elements are considered "client components"**.

  - Since **RSCs cannot serialize functions, you cannot pass the callbacks directly from server component to a native HTML element**.

    - You have to wrap that native HTML element inside another client component that then defines the callback.

    - This is where other frameworks like Qwik shine. Qwik is able to serialize closures so you do not have that problem.

  - I was **able to use the callback, albeit the Next.js did not like it, by making the callback a _server action_**.

    - Of course, as soon as it was triggered, the Next.js crashed because SOME properties the `onSubmit` callback on the `form` receives are not serializable.

- **Every server action you create is a separate endpoint**. This has **huge consequences**.

  - This most likely be **an attack vector**. I see **little to no chance that Vercel exposes the same security-related functionalities as, for example, AWS would**.

    - You cannot put WAF behind it. You cannot put rate-limiting behind it.

      - Overall, **I think that React community does not think about this very negative aspect of server actions yet, but when they do, they will realize that they cannot really use them in day-to-day work**.

        - So instead of using server action for the form submission (very common example people use to demonstrate functionality), one will most likely want to use the client component. Here is my demo code.

          ```ts
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

                  (event.target as HTMLFormElement).reset(); // this is pretty nice. You cannot do that with a sever action.

                  router.refresh(); // this is NOT a "browser refresh". More like "re-download components while keeping the state".
                }}
              >
                {children}
              </form>
            );
          };
          ```

        - Speaking of form submissions. **Notice that I'm using the `event.target` to reset the fields, rather than the `event.currentTarget`**. Why is that?

          - It is because **the `currentTarget` changes based on the flow of the event**. **After we make the fetch, the `currentTarget` is null** as the event was already finished its "lifecycle".

- TIL that **you can create a `FormData` object from the `event.currentTarget` that you get via the `onSubmit` handler**.

  - Very handy, especially for getting values from the inputs.

  - Note that this is **not the only way to do this**. You can also use the `event.target.elements`.

- The **server actions payload will include every variable that you access in the server action function**.

  - This is a huge footgun. This could lead to leaking secrets.

- You can **test server actions as regular functions**. The `use server` pragma is ignored by test runners. This makes sense as it is an implementation detail.

  - **Testing server components is a bit of a different ball game**.

    - First, there is **a mental shift. Your components are async**. To render the component, you have to "extract" JSX from the promise.

      ```tsx
      it("renders the JSX", async () => {
        server.use(
          rest.get("<http://localhost:3000/api>", (req, res, ctx) => {
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
      ```

  - It is nice that you can still use MSW here. **Having said that, I suspect there will be a huge shift towards e2e testing**. Especially given the nature of SSR.

    - It would be neat to have Cypress component testing work out of the box here.

- You **can use the `action` prop on the form in the _client component_**. Of course, the action will not be a server action, but it is still nice.

- There is a **new hook to optimistically push updates to state**.

  - Checkout the [_useOptimistic_](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions#experimental-useoptimistic) docs.

    - The API itself is nice, but since it is a hook, you will not get the benefit of "global" optimistic updates. You would need to drill down the setter through components (like in the case of useState and others).

- There is a **new hook to keep track of form state submission via the `action` prop**. Nice if you want to disable the submit button when the form is pending.

  - I get **Remix vibes when using those new hooks**. Maybe the React team was inspired by that meta-framework?
