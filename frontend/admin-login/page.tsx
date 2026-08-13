"use client";

import { FormEvent, useState } from "react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const usernameValue = username.trim();
    const passwordValue = password;

    setLoginError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            username: usernameValue,
            password: passwordValue,
          }),
        }
      );

      const text = await response.text();

      let data: {
        success?: boolean;
        error?: string;
      } = {};

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error(
            "Server returned invalid JSON."
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Login failed (${response.status})`
        );
      }

      if (!data.success) {
        throw new Error(
          data.error || "Login failed"
        );
      }

      // Login successful
      window.location.href = "/admin";

    } catch (error) {
      console.error(
        "Admin login error:",
        error
      );

      setLoginError(
        error instanceof Error
          ? error.message
          : "Could not connect to the server."
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">

      <div className="login-box">

        <h1>
          Mining Discovery
        </h1>

        <h2>
          Admin Login
        </h2>

        <form
          id="login-form"
          onSubmit={handleSubmit}
        >

          <input
            type="text"
            id="username"
            placeholder="Username"
            value={username}
            onChange={(event) =>
              setUsername(
                event.target.value
              )
            }
            required
          />

          <input
            type="password"
            id="password"
            placeholder="Password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            required
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        {loginError && (
          <p id="login-error">
            {loginError}
          </p>
        )}

      </div>

    </div>
  );
}
