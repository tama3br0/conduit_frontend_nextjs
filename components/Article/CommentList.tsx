import React from "react";
import { CommentTypes } from "../../types/types";
import styles from "../../styles/Comment.module.css";
import { deleteComment } from "../../services/commentService";

type Props = {
    comments: CommentTypes[];
};

const CommentList: React.FC<Props> = ({ comments }) => {
    const handleDelete = async (articleId: string, id: string) => {
        // 確認ダイアログを表示し、ユーザーが削除を確認した場合のみ削除を実行します
        const confirmDelete = window.confirm("なん…だと…ッ");
        if (!confirmDelete) {
            return; // ユーザーがキャンセルした場合は処理を中止します
        }

        try {
            await deleteComment(articleId, id);
            // コメントを削除した後、画面を更新するなどの処理を実行します。
            // 以下は画面の更新の例ですが、実際のアプリケーションに合わせて適切な処理を行ってください。

            // 画面を再読み込みする
            window.location.reload();

            // または、コメントを再取得して画面を更新するなど、アプリケーションの仕様に応じた処理を実行する
            // 例: fetchComments(); // コメントを再取得する関数を呼び出す（仮定）
        } catch (error) {
            console.error("削除エラー:", error);
        }
    };

    return (
        <div className={styles.commentsContainer}>
            <h3 className={styles.heading}>Comments</h3>
            {comments.map((comment) => (
                <div key={comment.id} className={styles.comment}>
                    <p className={styles.content}>{comment.content}</p>
                    <p className={styles.author}>By: {comment.author_name}</p>
                    <button
                        onClick={
                            () => handleDelete(comment.article_id, comment.id) // idをstring型のまま渡す
                        }
                        className={styles.btnOutlineDelete}
                    >
                        削除
                    </button>
                    <div className={styles.horizontalLine}></div>
                </div>
            ))}
        </div>
    );
};

export default CommentList;
