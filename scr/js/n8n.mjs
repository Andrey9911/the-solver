import e from "express";

export async function n8nStart(key,url, id) {
    // try {
    //     const response = await fetch(`${url}/api/v1/workflows/${id}/activate`, {
    //         method: 'POST',
    //         headers: {
    //             'X-N8N-API-KEY': key
    //         }
    //     });
        
    //     const data = await response.json();
    //     console.log('Workflow activated:', data);
        
    //     return {
    //         error: false,
    //         message: data
    //     };
    // } catch (error) {
    //     console.log('ERROR', error);
    //     return {
    //         error: true,
    //         message: error.message || error
    //     };
    // };

    }

/**
 * Управление авто-постингом через n8n вебхук
 * @param {string} webhookUrl - URL вебхука n8n для авто-постинга
 * @param {boolean} enabled - Включить или выключить авто-постинг
 * @param {Object} channelData - Данные канала (id, title и т.д.)
 * @returns {Promise<Object>} Результат операции
 */
export async function toggleAutoPosting(webhookUrl, enabled, channelData = {}) {
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                autoposting: enabled ? true : false,
                enabled: enabled,

                channelId: channelData.channelId || null,
                channelTitle: channelData.channelTitle || null,
                userId: channelData.userId || null,
                timestamp: new Date().toISOString(),
                timeInterval: channelData.timeInterval,
                isMedia: channelData.isMedia,
                Interval:channelData.Interval
            })
        });

        const data = await response.json().finally(r => console.log(r));
        
        
        return {
            error: false,
            success: true,
            message: data,
            enabled: enabled
        };
    } catch (error) {
        console.error('ERROR in toggleAutoPosting:', error);
        return {
            error: true,
            success: false,
            message: error.message || 'Произошла ошибка при управлении авто-постингом',
            enabled: !enabled
        };
    }
}