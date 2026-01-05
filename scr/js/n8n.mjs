import e from "express";

export async function n8nStart(key,url, id) {
    fetch(`${url}/api/v1/workflows/${id}/activate`, {
    method: 'POST',
    headers: {
        'X-N8N-API-KEY': key
    }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Workflow activated:', data)
        return {
            error: false,
            message: data
        };
    })
    .catch((error) => {
        console.log('ERROR', error);
        return {
            error: true,
            message: error
        };
    });
}