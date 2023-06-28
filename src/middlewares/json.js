export async function json(req, res) {
    const buffers = [];
    for await (const chunk of req) {
        buffers.push(chunk);
    }

    const body = Buffer.concat(buffers).toString();

    return JSON.parse(body);    
}