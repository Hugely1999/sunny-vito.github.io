import React, { useState } from 'react';
import axios from 'axios';
import './OCRUploader.css';

const OCRUploader = ({ onResultsReceived }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(0);

    // 处理文件选择
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        // 检查文件类型
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        if (!validTypes.includes(selectedFile.type)) {
            setError('不支持的文件类型，请上传图片、PDF或Excel文件');
            return;
        }

        // 检查文件大小 (限制为10MB)
        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('文件过大，请上传小于10MB的文件');
            return;
        }

        setFile(selectedFile);
        setError(null);

        // 如果是图片，创建预览
        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            // 非图片文件显示图标
            setPreview(null);
        }
    };

    // 处理文件上传
    const handleUpload = async () => {
        if (!file) {
            setError('请先选择文件');
            return;
        }

        setLoading(true);
        setProgress(0);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // 确定API端点
            const isImage = file.type.startsWith('image/');
            const endpoint = isImage ? '/api/ocr/image' : '/api/ocr/document';

            // 发送请求
            const response = await axios.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                }
            });

            // 处理结果
            if (response.data && response.data.success) {
                // 将结果传递给父组件
                onResultsReceived(response.data.data);
            } else {
                setError('处理失败: ' + (response.data.error || '未知错误'));
            }
        } catch (err) {
            console.error('上传错误:', err);
            setError('上传或处理失败: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    // 取消上传
    const handleCancel = () => {
        setFile(null);
        setPreview(null);
        setError(null);
        setProgress(0);
    };

    return (
        <div className="ocr-uploader">
            <div className="upload-container">
                <input
                    type="file"
                    id="file-input"
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.xlsx,.xls,.csv"
                    disabled={loading}
                    className="file-input"
                />
                
                <label htmlFor="file-input" className="file-label">
                    {preview ? (
                        <img src={preview} alt="预览" className="file-preview" />
                    ) : file ? (
                        <div className="file-icon">
                            {file.name.split('.').pop().toLowerCase()}
                        </div>
                    ) : (
                        <div className="upload-placeholder">
                            <i className="upload-icon">+</i>
                            <span>点击选择文件</span>
                            <small>支持图片、PDF和Excel文件</small>
                        </div>
                    )}
                </label>

                {file && (
                    <div className="file-info">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">({(file.size / 1024).toFixed(2)} KB)</span>
                    </div>
                )}

                {error && <div className="error-message">{error}</div>}

                {loading && (
                    <div className="progress-container">
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                        <span className="progress-text">{progress}%</span>
                    </div>
                )}

                <div className="button-group">
                    <button
                        className="upload-button"
                        onClick={handleUpload}
                        disabled={!file || loading}
                    >
                        {loading ? '处理中...' : '开始识别'}
                    </button>
                    
                    <button
                        className="cancel-button"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        取消
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OCRUploader; 