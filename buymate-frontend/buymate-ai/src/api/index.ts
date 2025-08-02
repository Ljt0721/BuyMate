import config from '../config';

const API_BASE = `${config.BACKEND_BASE_URL}/experiment_api`;

// -------------------- 类型定义 --------------------
export interface Product {
    id:               number;
    experiment_id:    number;
    image_id:         number;
    name:             string;
    brand:            string;
    current_price:    number;
    original_price:   number;
    live_price:       number;
    price_comparison: string;
    discount_info:    string;
    sizes:            string;
    material:         string;
    style:            string;
    colors:           string;
    features:         string;
    sales_rating:     number;
    shipping_time:    string;
    sales_volume:     string;
    reviews_count:    string;
    shipping_info:    string[];
    return_policy:    string[];
}

export interface SubmitPayload {
    subject_id:    string;   // 用 string 存前端 userId，后端如需 int 再转
    experiment_id: number;
    subject_type:  0 | 1 | 2 | 3; // 0:A 1:B 2:C 3:D
    choice:        boolean;
    choice_time:   string;   // ISO 字符串
}

// -------------------- 工具函数 --------------------
async function http<T>(path: string, opts?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...opts,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// -------------------- 业务接口 --------------------
export const api = {
    /** 获取实验商品列表 */
    async getProducts(expId: number): Promise<Product[]> {
        return http(`/products/?experiment_id=${expId}`);
    },

    /** 提交实验结果 */
    async submitResult(p: SubmitPayload): Promise<{ success: true }> {
        return http('/experiment/submit/', {
            method: 'POST',
            body: JSON.stringify(p),
        });
    },
};