export async function sleep(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms)
	})
}

export function isFulfilled<T>(
	value: PromiseSettledResult<T>,
): value is PromiseFulfilledResult<T> {
	return value.status === 'fulfilled'
}

export function splitArrayIntoChunks<T>(array: T[], chunkSize: number): T[][] {
	const chunks: T[][] = []
	for (let i = 0; i < array.length; i += chunkSize) {
		chunks.push(array.slice(i, i + chunkSize))
	}

	return chunks
}
