// Data collection progress

let progress = {
	status: `idle` as `idle` | `running`,
	total: 0,
	done: 0,
}
export const getProgress = () => progress
export const setProgressStatus = (status: `idle` | `running`) => {
	progress.status = status
}
export const setProgressTotal = (total: number) => {
	progress.total = total
}
export const setProgressDone = (done: number) => {
	progress.done = done
}
