import type { MetaFunction, LoaderFunction } from "remix";
import { useLoaderData, json, Link } from "remix";

type IndexData = {
  resources: Array<{ name: string; url: string }>;
  demos: Array<{ name: string; to: string }>;
};

// Loaders provide data to components and are only ever called on the server, so
// you can connect to a database or run any server side code you want right next
// to the component that renders it.
// https://remix.run/api/conventions#loader
export let loader: LoaderFunction = () => {
  let data: IndexData = {
    resources: [
      {
        name: "Remix Docs",
        url: "https://remix.run/docs"
      },
      {
        name: "React Router Docs",
        url: "https://reactrouter.com/docs"
      },
      {
        name: "Remix Discord",
        url: "https://discord.gg/VBePs6d"
      }
    ],
    demos: [
      {
        to: "demos/actions",
        name: "Actions"
      },
      {
        to: "demos/about",
        name: "Nested Routes, CSS loading/unloading"
      },
      {
        to: "demos/params",
        name: "URL Params and Error Boundaries"
      }
    ]
  };

  // https://remix.run/api/remix#json
  return json(data);
};

// https://remix.run/api/conventions#meta
export let meta: MetaFunction = () => {
  return {
    title: "Remix Starter",
    description: "Welcome to remix!"
  };
};

// https://remix.run/guides/routing#index-routes
export default function Index() {
  let data = useLoaderData<IndexData>();

  return (
    <div className="flex flex-col items-center justify-center w-screen min-h-screen p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900 dark:text-white">
      <header className="w-full pb-3 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-4xl font-thin text-center text-red-800 dark:text-green-600">
          Stories
        </h1>
      </header>
      <main className="flex flex-col items-center flex-grow w-full gap-8 pt-6 md:flex-row md:items-start">
        <section className="flex flex-col items-center justify-center w-full bg-white md:w-96 dark:bg-gray-800">
          {/* <StoryForm setEditing={setEditing} list={data} editing={editing} /> */}
        </section>
        <div className="flex flex-col w-full gap-4 md:w-96">
          {/*
          <StoriesList
            items={storyGroups.ready ?? []}
            title="Ready for development"
            setEditing={setEditing}
          />
          <StoriesList
            items={(storyGroups.draft ?? []).concat(storyGroups.draft_with_scenarios ?? [])}
            title="Draft"
            setEditing={setEditing}
          />
        */}
        </div>
        <div className="flex flex-col w-full gap-4 md:w-96">
          { /*
          <StoriesList
            items={storyGroups.development ?? []}
            title="In development"
            setEditing={setEditing}
          />
          <StoriesList
            items={storyGroups.approved ?? []}
            title="Done"
            setEditing={setEditing}
          />
          */
          }
        </div>
      </main>
      <footer className="mt-12 text-center text-gray-400 text-xs leading-loose">
        <p>
          Created with{' '}
          <a
            className="text-gray-900 dark:text-gray-100"
            href="http://seasoned.cc"
          >
            Seasoned DX Framework
          </a>
        </p>
      </footer>
    </div>
  );
}
