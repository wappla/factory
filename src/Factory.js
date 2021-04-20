export default class Factory {
    constructor(data = {}) {
        Object
            .keys(data)
            .forEach((key) => {
                this[key] = data[key]
            })
    }

    static async compose(records = 1, states = [], data = {}) {
        let finalRecords = records
        if (Number.isInteger(finalRecords)) {
            finalRecords = Array.from({ length: records }, () => ({}))
        }
        return Promise.all(finalRecords.map(async (record) => {
            const makeData = await this.make(states, data)
            return {
                ...makeData,
                ...record,
                ...data,
            }
        }))
    }

    static async create(records, states, data) {
        const recordsToPersist = await this.compose(records, states, data)
        const results = await this.persist(recordsToPersist)
        return results.map((result) => new this(result))
    }

    static async make() {
        return new Error('You need to implement the \'make\' function.')
    }

    static async persist() {
        return new Error('You need to implement the \'persist\' function.')
    }
}
