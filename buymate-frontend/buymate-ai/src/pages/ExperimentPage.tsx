import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config';
import styles from  './ExperimentPage.module.css'
const GROUP_DESC: Record<string, string> = {
    A: '无干预组',
    B: '真人干预组',
    C: '文字干预组',
    D: '语音干预组',
};

interface Product {
    id: number;
    experiment_id: number;
    image_id: number;
    name: string;
    brand: string;
    current_price: number;
    original_price: number;
    live_price: number;
    price_comparison: string;
    discount_info: string;
    sizes: string;
    material: string;
    style: string;
    colors: string;
    features: string[];
    sales_rating: number;
    shipping_time: string;
    sales_volume: string;
    reviews_count: string;
    shipping_info: string[];
    return_policy: string[];
    real_review: string;
}

interface TimestampedText {
    start: number; // 时间戳（秒）
    text: string; // 文字内容
}

export default function ExperimentPage() {
    const nav = useNavigate();
    const userId = sessionStorage.getItem('exp:userId');
    const group = sessionStorage.getItem('exp:group') || 'A';

    if (!userId) {
        nav('/');
        return null;
    }

    /* ---------- 状态 ---------- */
    const [expId, setExpId] = useState(1);
    const [startTs, setStartTs] = useState<number | null>(null);
    const [timeUsed, setTimeUsed] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showSimilarProducts, setShowSimilarProducts] = useState(false);
    const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [tagsList, setTagsList] = useState<string[] | null>(null);
    const [resourcesLoaded, setResourcesLoaded] = useState(false); // 新增状态：资源是否加载完成
    const [videoPlaying, setVideoPlaying] = useState(false); // 新增状态：视频是否开始播放
    const [timestampedTexts, setTimestampedTexts] = useState<TimestampedText[]>([]);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    /* ---------- 计时器 ---------- */
    useEffect(() => {
        if (!startTs) return;
        const interval = setInterval(() => {
            setTimeUsed(Date.now() - startTs);
        }, 100);

        return () => clearInterval(interval);
    }, [startTs]);

    /* ---------- 数据获取 ---------- */
    const fetchSimilarProducts = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(
                `${config.BACKEND_BASE_URL}/experiment_api/products/?experiment_id=${expId}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data && data.products && data.products.length > 0) {
                setSimilarProducts(data.products.slice(0, 3));
                setResourcesLoaded(true); // 设置资源加载完成
            } else {
                console.warn('No products found for experiment_id:', expId);
            }
        } catch (error) {
            console.error('Failed to fetch similar products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTimestampedTexts = async () => {
        try {
            const response = await fetch(`${config.BACKEND_BASE_URL}/media/json_outputs/${expId}_transcript.json`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setTimestampedTexts(data);
        } catch (error) {
            console.error('Failed to fetch timestamped texts:', error);
        }
    };

    useEffect(() => {
        setStartTs(null);
        setTimestampedTexts([]);
        fetchTimestampedTexts();
    }, [expId]);

    const getAiTranslation = async (text: string) => {
        try {
            const response = await fetch(
                `${config.BACKEND_BASE_URL}/experiment_api/experiment/ai_translation/?text=${encodeURIComponent(text)}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success && data.tags_list && data.tags_list.length > 0) {
                setAiResponse(data.translation);
                setTagsList(data.tags_list);
            } else {
                console.error('Failed to get AI translation:', data.error);
            }
        } catch (error) {
            console.error('Error getting AI translation:', error);
        }
    };

    useEffect(() => {
        if (startTs && timestampedTexts.length > 0) {
            const interval = setInterval(() => {
                const currentTime = (Date.now() - startTs) / 1000; // 当前时间（秒）
                const nextText = timestampedTexts.find((t) => t.start <= currentTime + 3.6 && t.start >= currentTime + 2.4);

                if (nextText) {
                    getAiTranslation(nextText.text);
                }
            }, 1000); // 每秒检查一次

            return () => clearInterval(interval);
        }
    }, [startTs, timestampedTexts]);

    /* ---------- 资源加载完成检测 ---------- */
    useEffect(() => {
        let videoLoaded = false;
        let imagesLoaded = 0;

        const checkResourcesLoaded = () => {
            if (videoLoaded && imagesLoaded >= similarProducts.length) {
                setResourcesLoaded(true);
            }
        };

        if (videoRef.current) {
            videoRef.current.addEventListener('loadeddata', () => {
                videoLoaded = true;
                checkResourcesLoaded();
            });
        }

        similarProducts.forEach((product) => {
            const img = new Image();
            img.src = `${config.BACKEND_BASE_URL}/media/images/${product.image_id}.jpg`;
            img.onload = () => {
                imagesLoaded++;
                checkResourcesLoaded();
            };
            img.onerror = () => {
                imagesLoaded++;
                checkResourcesLoaded();
            };
        });

        return () => {
            if (videoRef.current) {
                videoRef.current.removeEventListener('loadeddata', () => {});
            }
        };
    }, [expId, similarProducts]);

    /* ---------- 动作 ---------- */
    const startExp = () => {
        if (videoRef.current) {
            videoRef.current.play();
            setStartTs(Date.now());
            setShowSimilarProducts(false);
            setVideoPlaying(true); // 设置视频开始播放
        }
    };

    const stopExp = async () => {
        if (videoRef.current) {
            videoRef.current.pause();
        }

        if (startTs) {
            const totalTime = Date.now() - startTs;
            setTimeUsed(totalTime);
            setStartTs(null);

            await submitExperiment(false);
        }

        nav('/intro');
    };

    const submitExperiment = async (choice: boolean) => {
        try {
            const totalSeconds = timeUsed / 1000;
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${seconds.toFixed(6).padStart(9, '0')}`;

            const response = await fetch(
                `${config.BACKEND_BASE_URL}/experiment_api/experiment/submit/`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        subject_id: parseInt(userId!),
                        experiment_id: expId,
                        subject_type: group,
                        choice: choice,
                        choice_time: formattedTime,
                    }),
                }
            );

            const data = await response.json();
            if (!data.success) {
                console.error('Failed to submit experiment:', data.error);
            }
        } catch (error) {
            console.error('Error submitting experiment:', error);
        }
    };

    const handleChoice = async (buy: boolean) => {
        if (!startTs) return;

        const totalTime = Date.now() - startTs;
        setTimeUsed(totalTime);
        setStartTs(null);

        if (videoRef.current) {
            videoRef.current.pause();
        }

        await submitExperiment(buy);

        setTimeUsed(0);
        alert(`已记录${buy ? '购买' : '不购买'}选择，用时${(totalTime / 1000).toFixed(2)}秒`);
    };

    const toggleSimilarProducts = () => {
        if (!showSimilarProducts) {
            fetchSimilarProducts();
        }
        setShowSimilarProducts(!showSimilarProducts);
    };

    const getAudioFromText = async (text: string) => {
        try {
            const encodedText = encodeURIComponent(text);
            const response = await fetch(
                `${config.BACKEND_BASE_URL}/experiment_api/experiment/get_audio/?text=${encodedText}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const audioUrlObject = URL.createObjectURL(blob);
            setAudioUrl(audioUrlObject); // 更新音频 URL
        } catch (error) {
            console.error('Error getting audio:', error);
        }
    };
    useEffect(() => {
        if (aiResponse) {
            getAudioFromText(aiResponse);
        }
    }, [aiResponse]);
    /* ---------- 渲染 ---------- */
    return (
        <div
            style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                color: '#fff',
                fontFamily: 'system-ui, sans-serif',
                overflow: 'hidden',
                position: 'relative',
            }}
        >
            {/* 顶部 */}
            <header
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2vmin',
                    padding: '2vmin 3vmin',
                    zIndex: 10,
                }}
            >
                <span
                    style={{
                        padding: '1vmin 3vmin',
                        background: '#f9f9f9',
                        color: '#3d9712',
                        border: '0.2vmin solid #3d9712',
                        borderRadius: '1.2vmin',
                        fontSize: 'clamp(3vw, 3vw, 3vw)',
                    }}
                >
                    {group}组：{GROUP_DESC[group]}
                </span>
            </header>

            {/* 主体 */}
            <main
                style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {/* 左侧控制面板 */}
                <aside
                    style={{
                        position: 'absolute',
                        top: '20vh',
                        left: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2vw',
                        width: '15vw',
                        minWidth: 200,
                        zIndex: 5,
                        padding: '2vh 1vw',
                        backgroundColor: 'rgba(255, 255, 255, 0.6)',
                        border: '1px solid #ccc',
                        borderRadius: '1vmin',
                        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                    }}
                >
                    <label style={{ fontSize: 'clamp(2vw, 2vw, 2vw)', color: '#000' }}>
                        实验编号
                    </label>
                    <select
                        value={expId}
                        onChange={(e) => {
                            setExpId(Number(e.target.value));
                            setResourcesLoaded(false); // 重置资源加载状态
                            setShowSimilarProducts(false); // 重置相似商品显示状态
                            setAiResponse(null); // 重置AI响应
                        }}
                        disabled={isLoading}
                        style={{
                            fontSize: '2vw',
                            width: '15vw',
                            padding: '1vmin',
                            borderRadius: '1vmin',
                        }}
                    >
                        {Array.from({ length: 32 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                    </select>

                    <button
                        onClick={startExp}
                        disabled={startTs !== null || isLoading}
                        style={{
                            fontSize: '2vw',
                            width: '15vw',
                            padding: '1.5vmin 0',
                            background: startTs ? '#ccc' : '#3d9712',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '1vmin',
                            cursor: startTs ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {startTs ? '实验进行中...' : '开始实验'}
                    </button>

                    <button
                        onClick={stopExp}
                        style={{
                            fontSize: '2vw',
                            width: '15vw',
                            padding: '1.5vmin 0',
                            background: '#ff6b6b',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '1vmin',
                            cursor: 'pointer',
                        }}
                    >
                        结束实验
                    </button>

                    <div style={{ fontSize: '1vw', color: '#000' }}>
                        用时：{(timeUsed / 1000).toFixed(2)} 秒
                    </div>
                </aside>

                {/* 手机 + 视频 */}
                <div
                    style={{
                        position: 'absolute',
                        width: '50vh',
                        height: '95vh',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1,
                    }}
                >
                    <video
                        ref={videoRef}
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            borderRadius: '6vmin',
                        }}
                        src={`${config.BACKEND_BASE_URL}/media/videos/${expId}.mp4`}
                        preload="metadata"
                        onEnded={() => {
                            if (startTs) {
                                setTimeUsed(Date.now() - startTs);
                                setStartTs(null);
                            }
                        }}
                    />
                    <img
                        src={`${config.BACKEND_BASE_URL}/media/images/phone.png`}
                        alt="phone"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '70vh',
                            height: '103vh',
                            objectFit: 'contain',
                            zIndex: 2,
                            pointerEvents: 'none',
                            transform: 'translate(-9vh, -3vh)',
                        }}
                    />
                    {resourcesLoaded && group === 'C' || group === 'D' ? (
                        <button
                            onClick={toggleSimilarProducts}
                            style={{
                                position: 'absolute',
                                top: '20%',
                                left: '10%',
                                padding: '1vmin 3vmin',
                                background: 'rgba(128, 128, 128, 0.6)', // 半透明灰色背景
                                border: '0.1vw solid rgba(128, 128, 128, 0.6)', // 半透明灰色边框
                                borderRadius: '1vmin',
                                cursor: 'pointer',
                                width: '11vw',
                                gap: '0.2vw',
                                zIndex: 3,
                                fontSize: '1.2vw',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                            }}
                        >
                            <img
                                src={`${config.BACKEND_BASE_URL}/media/images/star.png`}
                                alt="star"
                                style={{
                                    position: 'relative',
                                    width: '1.5vw',
                                    height: '1.5vw',
                                }}
                            />
                            <div style={{
                                position: 'relative',
                                fontSize: '1vw',
                                color: '#fff', // 白色字体
                            }}>
                                {showSimilarProducts ? '收起相似商品' : '查看相似商品'}
                            </div>
                        </button>
                    ) : null}
                </div>

                {group === 'C' || group === 'D' ? (
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            right: '40%',
                            display: 'flex',
                            flexDirection: 'column',
                            zIndex: 100,
                            gap: '0.5vw',
                        }}
                    >
                        {group === 'D' ? (
                            <img
                                src={`${config.BACKEND_BASE_URL}/media/images/star.png`}
                                alt="star"
                                style={{
                                    width: '4vw',
                                    height: '4vw',
                                }}
                            />
                        ) : null}
                        {group === 'C' ? (
                            <img
                                src={`${config.BACKEND_BASE_URL}/media/images/star.png`}
                                alt="star"
                                style={{
                                    transform: videoPlaying ? 'translateX(16.0vw)' : 'translateX(0)',
                                    width: '4vw',
                                    height: '4vw',
                                }}
                            />
                        ) : null}
                        {group === 'C' && videoPlaying ? (
                            <div
                                style={{
                                    width: '19vw',
                                    height: 'auto',
                                    minHeight: '2vw',
                                    backgroundColor: 'rgba(128, 128, 128, 0.6)', // 半透明灰色
                                    borderRadius: '1vmin',
                                    padding: '1vmin',
                                    boxShadow: '0 0 10px rgba(128, 128, 128, 0.6)', // 半透明灰色阴影
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1vw',
                                }}
                            >
                                {aiResponse || '聆听中...'}
                            </div>

                        ) : null}
                        {group === 'D' && audioUrl && (
                            <audio
                                src={audioUrl}
                                autoPlay
                                onPlay={() => {
                                    if (videoRef.current) {
                                        videoRef.current.volume = 0.2;
                                    }
                                }}
                                onEnded={() => {
                                    if (videoRef.current) {
                                        videoRef.current.volume = 1.0;
                                    }
                                }}
                            />
                        )}
                        {(group === 'C' || group === 'D')&& videoPlaying ? (
                        <div
                            style={{
                                width: '19vw',
                                height: 'auto',
                                minHeight: '1.2vw',
                                backgroundColor: 'rgba(128, 128, 128, 0.6)', // 半透明灰色
                                borderRadius: '1vmin',
                                padding: '1vmin',
                                boxShadow: '0 0 10px rgba(128, 128, 128, 0.6)', // 半透明灰色阴影
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.8vw',
                            }}
                        >
                            {tagsList?.join(', ')}
                        </div>
                        ): null}
                    </div>
                ) : null}
            </main>

            {/* 右下角按钮 */}
            <footer
                style={{
                    position: 'absolute',
                    bottom: '2vw',
                    right: '2vw',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2vw',
                }}
            >
                <button
                    onClick={() => handleChoice(true)}
                    disabled={startTs === null}
                    style={{
                        fontSize: '2vw',
                        padding: '1.5vmin 4vmin',
                        borderRadius: '100vmin',
                        border: 'none',
                        background: startTs ? '#2b7711' : '#ccc',
                        color: '#f4f0ce',
                        cursor: startTs ? 'pointer' : 'not-allowed',
                    }}
                >
                    购买此商品
                </button>
                <button
                    onClick={() => handleChoice(false)}
                    disabled={startTs === null}
                    style={{
                        fontSize: '2vw',
                        padding: '1.5vmin 4vmin',
                        borderRadius: '100vmin',
                        border: 'none',
                        background: startTs ? '#2b7711' : '#ccc',
                        color: '#f4f0ce',
                        cursor: startTs ? 'pointer' : 'not-allowed',
                    }}
                >
                    不购买此商品
                </button>
            </footer>

            {/* 相似商品列表 */}
            {resourcesLoaded && showSimilarProducts && similarProducts.length > 0 && (
                <div
                    style={{
                        position: 'absolute',
                        top: '28%',
                        left: '40%',
                        width: '20%',
                        display: 'flex',
                        gap: '1vmin',
                        zIndex: 1000,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        padding: '1vmin',
                        borderRadius: '0.5vmin',
                        boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            gap: '1vmin',
                            scrollBehavior: 'smooth',
                            overflowX: 'hidden', // 隐藏默认滚动条
                            scrollSnapType: 'x mandatory',
                            msOverflowStyle: 'none',
                            scrollbarWidth: 'none',
                            zIndex: 100,
                        }}
                        onWheel={(_e: React.WheelEvent<HTMLDivElement>) => {
                            // 如果拖动功能和鼠标滚动冲突，可以在这里处理冲突逻辑
                            // 否则保留鼠标滚动功能
                            // _e.preventDefault(); // 如果需要禁用鼠标滚轮滚动，取消注释
                        }}
                        onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
                            const container = e.currentTarget;
                            const startX = e.clientX;
                            const startScrollLeft = container.scrollLeft;

                            const onMouseMove = (e: MouseEvent) => {
                                const dx = e.clientX - startX;
                                container.scrollLeft = startScrollLeft - dx;
                            };

                            const onMouseUp = () => {
                                document.removeEventListener('mousemove', onMouseMove);
                                document.removeEventListener('mouseup', onMouseUp);
                            };

                            document.addEventListener('mousemove', onMouseMove);
                            document.addEventListener('mouseup', onMouseUp);
                        }}
                    >
                        {similarProducts.map((product) => (
                            <div
                                key={product.id}
                                style={{
                                    width: '8vw', // 调整宽度
                                    minWidth: '8vw',
                                    backgroundColor: '#fff',
                                    borderRadius: '0.8vmin',
                                    boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    fontSize: '1.2vmin', // 调整字体大小
                                    scrollSnapAlign: 'start',

                                }}
                                className = {styles.noSelect}
                            >
                                {/* 商品图片部分 */}
                                <div style={{
                                    minHeight: '8vw',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <img
                                        src={`${config.BACKEND_BASE_URL}/media/images/${product.image_id}.jpg`}
                                        alt={product.name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0
                                        }}
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://via.placeholder.com/150?text=图片加载失败';
                                        }}
                                    />
                                </div>

                                {/* 商品信息部分 */}
                                <div style={{
                                    padding: '1vmin',
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                }}
                                >
                                    <div>
                                        <h3 style={{
                                            margin: '0 0 0.5vmin 0',
                                            fontSize: '1.4vmin',
                                            fontWeight: 'bold',
                                            color: '#333',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {product.name}
                                        </h3>
                                        <p style={{
                                            margin: '0 0 0.5vmin 0',
                                            fontSize: '1.2vmin',
                                            color: '#666'
                                        }}>
                                            {product.brand}
                                        </p>

                                        {/* 新增的价格比较信息 */}
                                        <div style={{
                                            fontSize: '1.2vmin',
                                            color: product.price_comparison.includes('优惠') ? '#f56c6c' : '#67c23a',
                                            margin: '0.5vmin 0'
                                        }}>
                                            {product.price_comparison}
                                        </div>
                                    </div>

                                    <div>
                                        {/* 价格信息 */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            marginBottom: '0.5vmin'
                                        }}>
                            <span style={{
                                color: '#e53935',
                                fontWeight: 'bold',
                                fontSize: '1.4vmin'
                            }}>
                                ¥{product.current_price}
                            </span>
                                            {product.original_price && product.original_price !== product.current_price && (
                                                <span style={{
                                                    color: '#999',
                                                    textDecoration: 'line-through',
                                                    marginLeft: '1vmin',
                                                    fontSize: '1.2vmin'
                                                }}>
                                    ¥{product.original_price}
                                </span>
                                            )}
                                        </div>

                                        {/* 评分和销量 */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: '1.2vmin',
                                            color: '#666',
                                            marginBottom: '0.5vmin'
                                        }}>
                                            <span>评分: {product.sales_rating} ★</span>
                                            <span>{product.sales_volume}</span>
                                        </div>

                                        {/* 新增的商品特征 */}
                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '0.5vmin',
                                            marginBottom: '0.5vmin'
                                        }}>
                                            {product.features.slice(0, 3).map((feature, index) => (
                                                <span key={index} style={{
                                                    backgroundColor: '#f0f9eb',
                                                    color: '#67c23a',
                                                    padding: '0.2vmin 0.5vmin',
                                                    borderRadius: '0.3vmin',
                                                    fontSize: '1.0vmin'
                                                }}>
                                    {feature}
                                </span>
                                            ))}
                                        </div>

                                        {/* 新增的真实评价 */}
                                        {product.real_review && (
                                            <div style={{
                                                fontSize: '1.0vmin',
                                                color: '#909399',
                                                fontStyle: 'italic',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                "{product.real_review.split('——')[0]}"
                                            </div>
                                        )}

                                        {/* 新增的退换货和运输信息 */}
                                        <div style={{
                                            fontSize: '1.0vmin',
                                            color: '#666',
                                            marginBottom: '0.5vmin'
                                        }}>
                                            {product.return_policy.map((policy, index) => (
                                                <span key={index}>{policy}{index < product.return_policy.length - 1 ? ' | ' : ''}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}