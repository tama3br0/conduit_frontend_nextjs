import { CommentTypes } from "../types/types";

// コメントを投稿するためのサービス
export const submitComment = async (comment: CommentTypes): Promise<void> => {
    const response = await fetch(
        `http://localhost:3000/api/articles/${comment.article_id}/comments`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(comment),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to submit comment");
    }
};

// コメントを削除するためのサービス
export const deleteComment = async (
    articleId: string,
    commentId: string
): Promise<void> => {
    const response = await fetch(
        `http://localhost:3000/api/articles/${articleId}/comments/${commentId}`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to delete comment");
    }
};
