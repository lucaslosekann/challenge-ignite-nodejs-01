import { randomUUID } from 'node:crypto';
import Database from './database.js';
import buildRoutePath from './util/build-route-path.js';
import { createReadStream } from 'node:fs';
import { parse } from 'csv-parse';

const database = new Database();


export const routes = [
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: async (req, res) => {
            const { title, description } = req.body;
            if(!title || !description) return res.writeHead(400).end();
            database.insert('tasks', { 
                id: randomUUID(),
                title,
                description,
                completed_at: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
            return res.writeHead(201).end();
        }
    },
    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: async (req, res) => {
            const { q } = req.query;
            const tasks = database.select('tasks', q && {
                title: q,
                description: q
            });
            return res.writeHead(200).end(JSON.stringify(tasks));
        }
    },
    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: async (req, res) => {
            const { id } = req.params;
            const { title, description } = req.body;
            if(!title && !description) return res.writeHead(400).end();
            const updated = database.update('tasks', id, {
                ...(title && { title }),
                ...(description && { description }),
                updated_at: new Date().toISOString()
            });
            if (updated) {
                return res.writeHead(200).end();
            }else {
                return res.writeHead(404).end();
            }
        }
    },
    {
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'),
        handler: async (req, res) => {
            const { id } = req.params;
            const deleted = database.delete('tasks', id);
            if (deleted) {
                return res.writeHead(200).end();
            }else {
                return res.writeHead(404).end();
            }
        }
    },
    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id/complete'),
        handler: async (req, res) => {
            const { id } = req.params;
            const task = database.get('tasks', id);
            if (!task) return res.writeHead(404).end();
            if (task.completed_at){
                database.update('tasks', id, {
                    completed_at: null,
                    updated_at: new Date().toISOString()
                });
            }else{
                database.update('tasks', id, {
                    completed_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
            }
            return res.writeHead(200).end();
        }
    },
    {
        method: 'POST',
        path: buildRoutePath('/tasks/import'),
        handler: async (req, res) => {
            const csvPath = new URL('../data.csv', import.meta.url);
            const stream = createReadStream(csvPath);
            const parser = parse({
                delimiter: ',',
                skip_empty_lines: true,
                columns: true
            });
            for await (const record of stream.pipe(parser)) {
                const { title, description } = record;
                if(!title || !description) continue;
                
                database.insert('tasks', {
                    id: randomUUID(),
                    title,
                    description,
                    completed_at: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
            }
            return res.writeHead(200).end();
        }
    }
]

