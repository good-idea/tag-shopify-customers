const arrayContainsOneOf = (array, searches) =>
	searches.reduce((acc, search) => acc || array.includes(search), false)

const promiseSerial = funcs =>
	funcs.reduce(
		(promise, func) =>
			promise.then(result => func().then(Array.prototype.concat.bind(result))),
		Promise.resolve([]),
	)

const trace = n => {
	console.log(n)
	return n
}

module.exports = {
	arrayContainsOneOf,
	promiseSerial,
	trace,
}
