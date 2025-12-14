import React from "react";
import { useTranslateDynamic, useTranslate } from "@polyglot/react";

interface Comment {
  id: number;
  username: string;
  text: string;
  timestamp: string;
}

/**
 * Example: Real-time user comments translation
 * Use case: Social media, forums, chat apps
 */
export default function CommentsList() {
  const t = useTranslate();
  const translateDynamic = useTranslateDynamic();
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [translatedComments, setTranslatedComments] = React.useState<
    Map<number, string>
  >(new Map());

  // Simulate fetching comments from API
  React.useEffect(() => {
    // In real app: fetch('/api/comments')
    const mockComments: Comment[] = [
      {
        id: 1,
        username: "John",
        text: "This product is amazing!",
        timestamp: "2 hours ago",
      },
      {
        id: 2,
        username: "Maria",
        text: "Great quality and fast delivery",
        timestamp: "5 hours ago",
      },
      {
        id: 3,
        username: "Ahmed",
        text: "Exactly what I was looking for",
        timestamp: "1 day ago",
      },
    ];
    setComments(mockComments);
    translateComments(mockComments);
  }, []);

  const translateComments = async (comments: Comment[]) => {
    const translated = new Map<number, string>();

    // Translate each comment
    for (const comment of comments) {
      const translatedText = await translateDynamic(comment.text);
      translated.set(comment.id, translatedText);
    }

    setTranslatedComments(translated);
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h3>{t("User Comments")}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {comments.map((comment) => (
          <div
            key={comment.id}
            style={{
              padding: "1rem",
              border: "1px solid #ddd",
              borderRadius: "8px",
              backgroundColor: "#f9f9f9",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <strong>{comment.username}</strong>
              <small>{comment.timestamp}</small>
            </div>
            <p
              style={{ margin: "0.5rem 0", color: "#666", fontSize: "0.9rem" }}
            >
              <em>
                {t("Original")}: {comment.text}
              </em>
            </p>
            <p style={{ margin: "0.5rem 0", fontSize: "1rem" }}>
              <strong>
                {t("Translation")}:{" "}
                {translatedComments.get(comment.id) || "..."}
              </strong>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
