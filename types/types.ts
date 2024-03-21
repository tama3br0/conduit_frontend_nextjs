export interface ArticleTypes {
    id: string;
    title: string;
    description: string;
    body: string;
    created_at: string;
    updated_at: string;
    tag_list: string[];
    image_blob_id: string; // 画像のBlob IDを表すプロパティ
}

export interface CommentTypes {
    id: number;
    content: string;
    author_name: string;
    article_id: number;
    created_at: string;
    updated_at: string;
}
