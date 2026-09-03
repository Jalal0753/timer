export interface Category {
    id: number;
    name: string;
    color: string;
};

export interface Session {
    id: number;
    category_id: number | null;
    started_at: string;
    duration: number;
}