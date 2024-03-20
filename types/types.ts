export interface Article {
    id: string;
    title: string;
    description: string;
    body: string;
    created_at: string;
    updated_at: string;
    tag_list: string[];
    image_blob_id: string; // 画像のBlob IDを表すプロパティ
}
