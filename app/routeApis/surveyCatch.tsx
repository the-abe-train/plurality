import { useCatch } from "@remix-run/react";
import { CatchBoundaryComponent } from "@remix-run/react/routeModules";

export const surveyCatch: CatchBoundaryComponent = () => {
  const caught = useCatch();

  return (
    <main className="max-w-4xl flex-grow mx-4 flex flex-col my-6 flex-wrap">
      <h1 className="font-header mb-2 text-2xl">Survey not found</h1>
      <p>Status: {caught.status}</p>
      <pre>
        <code>{JSON.stringify(caught.data, null, 2)}</code>
      </pre>
    </main>
  );
};
