import { useState, useEffect } from 'react';

interface FileWithPreview {
    file: File;
    previewUrl: string;
}

export function useFilePreview() {
    const [filePreviews, setFilePreviews] = useState<FileWithPreview[]>([]);

    // Очищаем URL объекты при размонтировании компонента
    useEffect(() => {
        return () => {
            // Освобождаем все созданные URL при размонтировании
            filePreviews.forEach(item => {
                URL.revokeObjectURL(item.previewUrl);
            });
        };
    }, [filePreviews]);

    // Функция для добавления файлов
    const addFiles = (newFiles: File[]) => {
        const newPreviews = newFiles.map(file => ({
            file,
            previewUrl: URL.createObjectURL(file)
        }));

        setFilePreviews(prev => [...prev, ...newPreviews]);
        return newPreviews.map(item => item.file);
    };

    // Функция для удаления файла по индексу
    const removeFile = (index: number) => {
        setFilePreviews(prev => {
            // Освобождаем URL удаляемого файла
            URL.revokeObjectURL(prev[index].previewUrl);

            // Удаляем файл из списка
            return prev.filter((_, i) => i !== index);
        });
    };

    // Очистка всех файлов
    const clearFiles = () => {
        filePreviews.forEach(item => {
            URL.revokeObjectURL(item.previewUrl);
        });
        setFilePreviews([]);
    };

    return {
        filePreviews,
        addFiles,
        removeFile,
        clearFiles,
        files: filePreviews.map(item => item.file)
    };
}