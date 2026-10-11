# Orbit.js

**A small JavaScript helper library for simpler web development.**

Orbit.js provides short functions for working with HTML elements, CSS, browser `localStorage`, and a Supabase database. It's built for plain HTML + JavaScript projects—no build tools or dependencies required.

## Installation / linking


```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Orbit.js Demo</title>
  <script src="orbit.js" defer></script>
  <script src="app.js" defer></script>
</head>
<body>
  <input id="username" placeholder="Username">
  <button id="save">Save</button>
  <p id="output"></p>
</body>
</html>
```

Alternatively, link the current GitHub-hosted file directly via a raw-file URL:

```html
<script src="https://raw.githubusercontent.com/justorbit/JS/main/main.js" defer></script>
```

> For reliable production use, download or pin a specific version rather than depending on a file that may change on the `main` branch. These examples assume the library lives at `main.js` in the `main` branch of the linked repository.

## DOM helpers

All DOM helpers take an **element ID** (without `#`). The element must exist when the function runs.

| Function | What it does | Example |
| --- | --- | --- |
| `cout(id, data)` | Replaces an element's HTML content | `cout("output", "Hello!");` |
| `append(id, data)` | Adds HTML to the end of an element | `append("output", "<b> World</b>");` |
| `getdata(id)` | Returns an element's HTML content | `let html = getdata("output");` |
| `getval(id)` | Reads an input's current value | `let name = getval("username");` |
| `setval(id, val)` | Sets an input's value | `setval("username", "Orbit");` |
| `style(id, name, value)` | Sets an inline CSS property | `style("output", "color", "red");` |
| `getstyle(id)` | Returns an element's inline style object | `let s = getstyle("output");` |

```javascript
cout("output", "Hello, Orbit!");
append("output", " 🚀");
console.log(getdata("output"));

setval("username", "Orbit");
console.log(getval("username"));

style("output", "backgroundColor", "black");
style("output", "fontSize", "20px");
console.log(getstyle("output").fontSize);
```

**Notes:** `cout()` and `append()` use `innerHTML`, so don't pass untrusted user input directly to them; HTML may be interpreted by the browser. `getstyle()` reads inline styles, not necessarily styles from CSS stylesheets. CSS property names in `style()` can use JavaScript-style names such as `backgroundColor`.

## LocalStorage helpers

These functions save small pieces of data in the browser, across page reloads, for the current website origin.

| Function | What it does | Example |
| --- | --- | --- |
| `lstore(key, value)` | Saves a value | `lstore("theme", "dark");` |
| `lread(key)` | Reads a value, or `null` if missing | `lread("theme");` |
| `lrm(key)` | Removes one saved item | `lrm("theme");` |
| `lcls()` | Clears **all** localStorage items for this origin | `lcls();` |
| `lappend(key, value)` | Appends text to an existing value; creates it if missing | `lappend("notes", "Hello");` |

```javascript
lstore("username", "Orbit");
console.log(lread("username")); // "Orbit"

lappend("notes", "Hello");
lappend("notes", " World");
console.log(lread("notes")); // "Hello World"

lrm("username");
// lcls(); // Be careful: clears everything saved by this site in localStorage.
```

**Notes:** localStorage stores values as strings. To save objects or arrays, use `JSON.stringify()` when writing and `JSON.parse()` when reading. Don't store passwords or secret keys in localStorage.

## Supabase setup

Orbit.js includes helpers for a **single Supabase table** using Supabase's REST API.

1. Create a Supabase project and a table (for example, `users` with `id` and `username` columns).
2. Configure **Row Level Security (RLS)** and policies appropriate to your application. Without suitable policies, operations can be denied; unsafe policies can expose data.
3. Define the following variables **before calling the API functions**. For example, add them in `app.js`:

```javascript
const URL = "https://YOUR_PROJECT.supabase.co";
const KEY = "YOUR_PUBLISHABLE_KEY";
const TABLE = "users";
```

The library expects these names to be available in the page's JavaScript scope. Its sample configuration lines are commented out in `main.js`.

> Use only a Supabase **publishable key** in frontend code, **never** a secret or service-role key. A publishable key is not a substitute for authentication or RLS. The current library sends no user login token, so access depends on the permissions/policies for unauthenticated requests.

### Database functions (CRUD)

| Function | Action | Example |
| --- | --- | --- |
| `POST(column, value)` | Inserts a **new row** with one column value | `await POST("username", "Orbit");` |
| `GET(column, value?)` | Reads **all columns** of accessible rows, optionally filtering by equality | `await GET("username", "Orbit");` |
| `PUT(id, column, value)` | Updates one column of the row whose `id` matches | `await PUT(1, "username", "John");` |
| `DELETE(id)` | Deletes the row whose `id` matches | `await DELETE(1);` |

```javascript
// CREATE
let created = await POST("username", "Orbit");

// READ: all accessible rows (the column argument is not used to select columns)
let all = await GET("username");

// READ: only rows whose username equals "Orbit"
let matches = await GET("username", "Orbit");

// UPDATE: changes username for row id 1
let updated = await PUT(1, "username", "John");

// DELETE: removes row id 1
let deleted = await DELETE(1);
```

**Important details:**

- `GET("username")` currently returns **every column** (`select=*`) for all accessible rows, not just the `username` column.
- `GET("username", "Orbit")` filters rows using Supabase's `eq` (equals) operator. It returns an array of matching rows, which can be empty.
- `PUT()` is the function's name, but it sends an HTTP **PATCH** request under the hood.
- `PUT()` and `DELETE()` assume the table has a column named `id`.
- Every database operation is asynchronous; use `await` inside an `async` function or a JavaScript module.
- Successful requests do not necessarily mean a row was changed: an update or delete matching no accessible rows can return an empty array.

### Handling responses and errors

Every database helper returns an object with a `success` property.

On success:

```javascript
{
  success: true,
  data: [{ id: 1, username: "Orbit" }]
}
```

On failure:

```javascript
{
  success: false,
  error: "Error message",
  code: "23505" // Present for some database errors
}
```

`23505` is PostgreSQL's unique-constraint violation code (for example, when a username column is configured as `UNIQUE`).

```javascript
async function addUser() {
  const username = getval("username");
  const result = await POST("username", username);

  if (result.success) {
    cout("output", "User added!");
  } else if (result.code === "23505") {
    cout("output", "That username is taken.");
  } else {
    cout("output", "Could not add user.");
    console.error(result.error);
  }
}

document.getElementById("save").addEventListener("click", addUser);
```

Avoid displaying raw database errors to users in production. `API(method, query, data)` is the internal helper used by `POST`, `GET`, `PUT`, and `DELETE`; you normally won't need to call it directly.

## Limitations

Orbit.js is a personal convenience library, not a full framework. At present:

- DOM helpers require valid IDs and do not check whether an element exists.
- `cout()` / `append()` interpret HTML rather than treating it as plain text.
- Supabase functions work with one configured table at a time.
- `POST()` and `PUT()` accept one column/value pair per call.
- `GET()` supports equality filtering on one column, not advanced queries.
- No authentication/login workflow is included.
- The Supabase helper expects a JSON response and may report an error if a successful response has no JSON body.

---

Made to keep JavaScript simple. 
