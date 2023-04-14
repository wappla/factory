export default class Factory {
    
    static async compose(
        records: number | Object[] = 1,
        states: string[] = [],
        data: Object = {}
    ): Promise<Object[]> {
        let finalRecords: Object[]
        if (Array.isArray(records)) {
            finalRecords = records
        } else {
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

    static async create<T extends typeof Factory>(
        this: T,
        records?: number | Object[],
        states?:string[],
        data?: Object,
    ): Promise<Array<InstanceType<T>>> {
        const recordsToPersist = await this.compose(records, states, data)
        const results = await this.persist(recordsToPersist)
        return results.map((result) => {
            const factory = new this() as InstanceType<T>
            return Object.assign(factory, result)
        })
    }

    static async make(states?: string[], data?: Object): Promise<Object> {
        throw new Error('You must implement the `make` method.')
    }

    static async persist(records: Object[]): Promise<Object[]> {
        throw new Error('You must implement the `persist` method.')
    }
}
