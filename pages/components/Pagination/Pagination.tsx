import Link from "next/link";
import { Article } from "@/types/types";
import styles from "../../../styles/Pagination.module.css";

const Pagination = ({ articles }: { articles: Article[] }) => {
    // ページネーションのリンクを動的に生成する関数
    const renderPaginationLinks = () => {
        const totalPages = Math.ceil(articles.length / 10); // 10は1ページあたりの記事数
        const paginationLinks = [];

        for (let i = 1; i <= totalPages; i++) {
            paginationLinks.push(
                <li key={i} className={styles.pageItem}>
                    <Link href={`/?page=${i}`} className={styles.pageLink}>
                        {i}
                    </Link>
                </li>
            );
        }

        return paginationLinks;
    };

    return <ul className={styles.pagination}>{renderPaginationLinks()}</ul>;
};

export default Pagination;
