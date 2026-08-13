"use client";

import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:3000";

type Message = {
  role: string;
  content: string;
  timestamp: string;
};

type Conversation = {
  id: string;
  updatedAt: string;
  messages: Message[];
};

export default function AdminPage() {
  const [conversations, setConversations] = useState<
    Conversation[]
  >([]);

  const [selectedConversationId, setSelectedConversationId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ============================================================
  // SELECTED CONVERSATION
  // ============================================================

  const selectedConversation =
    conversations.find(
      (conversation) =>
        conversation.id === selectedConversationId
    ) || null;


  // ============================================================
  // CHECK ADMIN LOGIN
  // ============================================================

  async function checkAdminLogin() {
    try {
      const response = await fetch(
        "/api/admin/check",
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Login check failed"
        );
      }

      const data =
        await response.json();

      if (!data.authenticated) {
        window.location.href =
          "/admin-login";

        return false;
      }

      return true;

    } catch (error) {
      console.error(
        "Admin login check error:",
        error
      );

      setError(
        "Could not connect to the AI server."
      );

      return false;
    }
  }


  // ============================================================
  // LOAD CONVERSATIONS
  // ============================================================

  async function loadConversations() {
    setLoading(true);
    setError("");

    try {
      const response =
        await fetch(
         "/api/admin/conversations",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

      if (!response.ok) {

        if (response.status === 401) {
          window.location.href =
            "/admin-login";

          return;
        }

        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const data =
        await response.json();

      setConversations(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(
        "Conversation loading error:",
        error
      );

      setError(
        "Could not connect to the AI server."
      );

    } finally {

      setLoading(false);
    }
  }


  // ============================================================
  // SHOW CONVERSATION
  // ============================================================

  function showConversation(
    id: string
  ) {
    setSelectedConversationId(id);
  }


  // ============================================================
  // DELETE CONVERSATION
  // ============================================================

  async function deleteConversation() {

    if (!selectedConversationId) {
      return;
    }

    const confirmed =
      window.confirm(
        "Delete this conversation?"
      );

    if (!confirmed) {
      return;
    }

    try {

      const response =
        await fetch(
          `/api/admin/conversations/${selectedConversationId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

      if (!response.ok) {
        throw new Error(
          "Delete failed"
        );
      }

      setSelectedConversationId(
        null
      );

      await loadConversations();

    } catch (error) {

      console.error(
        "Delete conversation error:",
        error
      );

      window.alert(
        "Could not delete conversation."
      );
    }
  }


  // ============================================================
  // LOGOUT
  // ============================================================

  async function logout() {

    try {

      await fetch(
        "/api/admin/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );

    } catch (error) {

      console.error(
        "Logout error:",
        error
      );

    }

    window.location.href =
      "/admin-login";
  }


  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {

    async function start() {

      const loggedIn =
        await checkAdminLogin();

      if (loggedIn) {
        await loadConversations();
      }
    }

    start();

  }, []);


  // ============================================================
  // SORT CONVERSATIONS
  // ============================================================

  const sortedConversations =
    [...conversations].sort(
      (a, b) =>
        new Date(
          b.updatedAt
        ).getTime() -
        new Date(
          a.updatedAt
        ).getTime()
    );


  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="admin-page">


      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="admin-header">

        <div>

          <h1>
            Mining Discovery
          </h1>

          <span>
            AI Assistant — Admin
          </span>

        </div>


        <button
          id="logout-button"
          type="button"
          onClick={logout}
        >
          Logout
        </button>

      </header>


      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="admin-container">


        {/* ====================================================
            CONVERSATION LIST
        ==================================================== */}

        <section className="conversation-list">

          <div className="conversations-header">

            <h2>
              Conversations
            </h2>


            <div className="admin-actions">

              <button
                id="refresh-button"
                type="button"
                onClick={
                  loadConversations
                }
                disabled={loading}
              >
                ↻ Refresh
              </button>

            </div>

          </div>


          <div id="conversation-list">

            {loading ? (

              <p className="loading">
                Loading conversations...
              </p>

            ) : error ? (

              <p className="loading">
                {error}
              </p>

            ) : sortedConversations.length ===
              0 ? (

              <p className="loading">
                No conversations yet.
              </p>

            ) : (

              sortedConversations.map(
                (conversation) => {

                  const firstClientMessage =
                    conversation.messages.find(
                      (message) =>
                        message.role ===
                        "client"
                    );

                  const preview =
                    firstClientMessage
                      ? firstClientMessage.content
                      : "No message";

                  const date =
                    new Date(
                      conversation.updatedAt
                    );

                  return (

                    <div
                      key={
                        conversation.id
                      }
                      className={`conversation-item ${
                        conversation.id ===
                        selectedConversationId
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        showConversation(
                          conversation.id
                        )
                      }
                    >

                      <div className="conversation-date">

                        {date.toLocaleString()}

                      </div>


                      <div className="conversation-preview">

                        {preview}

                      </div>


                      <div className="conversation-count">

                        {
                          conversation.messages
                            .length
                        }{" "}
                        messages

                      </div>

                    </div>
                  );
                }
              )
            )}

          </div>

        </section>


        {/* ====================================================
            CONVERSATION VIEW
        ==================================================== */}

        <section className="conversation-view">

          {!selectedConversation ? (

            <div id="empty-state">

              <h2>
                Select a conversation
              </h2>

              <p>
                Choose a conversation from
                the list to view the complete
                client and AI chat.
              </p>

            </div>

          ) : (

            <div
              id="chat-view"
              className="chat-view"
            >

              <div className="chat-header">

                <h2 id="conversation-title">
                  Conversation
                </h2>


                <button
                  id="delete-button"
                  type="button"
                  onClick={
                    deleteConversation
                  }
                >
                  Delete
                </button>

              </div>


              <div id="messages">

                {selectedConversation.messages.map(
                  (message, index) => (

                    <div
                      key={index}
                      className={`admin-message ${
                        message.role ===
                        "client"
                          ? "client"
                          : "ai"
                      }`}
                    >

                      <div className="message-role">

                        {message.role ===
                        "client"
                          ? "Client"
                          : "AI"}

                      </div>


                      <div className="message-content">

                        {message.content}

                      </div>


                      <div className="message-time">

                        {new Date(
                          message.timestamp
                        ).toLocaleString()}

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}