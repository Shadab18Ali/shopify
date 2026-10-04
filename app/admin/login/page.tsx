"use client";

import { useFormState } from "react-dom";
import { login } from "../actions";

export default function LoginPage() {
  const [error, action] = useFormState(login, null);
  return (
    <main className="wrap narrow">
      <h1 className="h2">Admin</h1>
      <form action={action} className="stack">
        <label className="field">
          <span>Password</span>
          <input type="password" name="password" required autoFocus />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn">Sign in</button>
      </form>
    </main>
  );
}
