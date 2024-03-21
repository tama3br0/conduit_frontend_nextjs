import React, { useState } from "react";
import { submitComment } from "../../services/commentService";
import styles from "../../styles/Comment.module.css";

type Props = {
    articleId: number;
};

const CommentForm: React.FC<Props> = ({ articleId }) => {
    const [content, setContent] = useState("");
    const [authorName, setAuthorName] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await submitComment({
                content,
                author_name: authorName,
                article_id: articleId,
                id: 0,
                created_at: "",
                updated_at: "",
            });
            // コメント投稿後の処理を追加する場合はここに記述
            console.log("Comment submitted successfully!");
            // コメントフォームをクリア
            setContent("");
            setAuthorName("");

            // コメント投稿後に画面を更新する
            window.location.reload();
        } catch (error) {
            console.error("Error submitting comment:", error);
        }
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
                <input
                    className={styles.input}
                    type="text"
                    placeholder="貴様の名前を入力するのだッ！"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                />
            </div>
            <div className={styles.inputGroup}>
                <textarea
                    className={styles.textarea}
                    placeholder="好きにしゃべるがいいッ！"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
            </div>
            <div className={styles.inputGroup}>
                <button className={styles.button} type="submit">
                    コメントを投稿するッ！
                </button>
            </div>
        </form>
    );
};

export default CommentForm;
