import fs from 'node:fs/promises';

const databasePath = new URL('database.json', import.meta.url);

export default class Database {
    #database = {}

    constructor() {
        fs.readFile(databasePath, 'utf-8').then(data => {
            this.#database = JSON.parse(data);
        }).catch(err => {
            if (err.code === 'ENOENT') {
                this.#persist();
            } else {
                throw err;
            }
        })
    }

    #persist () {
        return fs.writeFile(databasePath, JSON.stringify(this.#database))
    }


    insert(table, data) {
        if (Array.isArray(this.#database[table])){
            this.#database[table].push(data)
        }else {
            this.#database[table] = [data]
        }
        this.#persist();
        return data;
    }

    get(table, id) {
        return this.#database[table].find(row => row.id === id);
    }

    select(table, search) {
        let data = this.#database[table] ?? [];
        if (search) {
            data = data.filter(row => {
                return Object.entries(search).some(([key, value]) => {
                    return row[key].toLowerCase().includes(value.toLowerCase());
                })
            })
        }
        return data;
    }

    delete(table, id) {
        const rowIndex = this.#database[table].findIndex(row => row.id === id);
        if (rowIndex > -1) {
            this.#database[table].splice(rowIndex, 1);
            this.#persist();
            return true;
        }else {
            return false;
        }
    }

    update(table, id, data) {
        const rowIndex = this.#database[table].findIndex(row => row.id === id);
        if (rowIndex > -1) {
            this.#database[table][rowIndex] = {
                ...this.#database[table][rowIndex],
                ...data,
                id
            }
            this.#persist();
            return true;
        }else{
            return false;
        }
    }
}