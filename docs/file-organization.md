# File organization

The source files for the webapp are in `./src`.
The structure of the `src` directory are as follows:

```bash
src
├── app
├── assets
├── features
│   ├── boats
│   │   ├── api
│   │   ├── components
│   │   └── hooks
│   ├── checkouts
│   │   ├── api
│   │   ├── components
│   │   └── hooks
│   └── ...
├── lib
├── types
└── views
    └── Boats
    └── ...
```

## App

The `app/` directory currently holds the default webpage (set in `./src/main.tsx`). It can (and should) be removed once we have more of the website in place.

## Assets

The `assets/` directory holds images and files used across the webapp. It is currently unused - perhaps we can remove it

## Features

The `features/` directory holds subdirectories related to individual areas of functionality. A directory in `features` may have one, several, or all of the following subdirectories

### api

The `api/` subdirectory contains functions that interface with the backend, querying or performing operations on the Supabase database

### hooks

The `hooks/` subdirectory contains react hooks that fetch and expose data to components

### components

The `components` subdirectory contains UI components that are specific to one specific feature

## lib

The `lib/` directory contains boilerplate and library code (currently only `supabaseClient.ts`) used to support other parts of the application.

## types

The `types/` directory contains type definitions. Type definitions can be gathered from Supabase directly with

```bash
npx supabase gen types typescript --project-id "vecptpgnhnedjiqunoli" --schema public > ./src/types/supabase.ts
```

## pages

The `pages/` directory contains individual webpages. Currently unused.
