const debug = require('debug')('tag')
const R = require('ramda')

const { getItems, putItem, clearCache } = require('./shopify')
const { tagMap } = require('./config')
const { promiseSerial, arrayContainsOneOf } = require('./utils')

const _findCustomerOrders = orders => id =>
	orders.filter(o => R.path(['customer', 'id'], o) === id)

const getOrderedItemIds = R.pipe(
	R.pluck('line_items'),
	R.map(R.pluck('product_id')),
	R.flatten,
)

const getTagsFromOrders = R.pipe(
	// Get the IDs all of the items they have ordered.
	getOrderedItemIds,
	R.map(a => tagMap.get(a) || []),
	R.flatten,
	R.uniq,
)

const run = async () => {
	const customers = await getItems('customer')
	const orders = await getItems('order')

	const findCustomerOrders = findCustomerOrders(orders)

	const applyTagsToCustomer = async c => {
		const { id, email, tags } = c
		console.log('')
		debug(`Applying tags to customer ${email}`)
		const customerOrders = findCustomerOrders(c.id)
		if (!customerOrders || customerOrders.length === 0) {
			debug(`   customer has no orders.`)
			return
		}
		const newTags = getTagsFromOrders(customerOrders)
		if (newTags.length === 0) {
			debug(`   customer did not order anything that needs tagging.`)
			return
		}
		if (R.difference(newTags, tags.split(', ')).length === 0) {
			debug(`   customer has no new tags`)
			return
		}
		// TODO: Don't bother to PUT new tags if the customer already has them all.
		debug(`   Assigning new tags to customer:\n   ${newTags.join(', ')}`)
		const allTags = [...tags.split(', '), ...newTags].join(', ')
		const newData = {
			tags: allTags,
		}
		const updatedCustomer = await putItem('customer', c.id, newData)
		debug(
			`   Customer has been updated and now has tags:\n   ${
				updatedCustomer.tags
			}`,
		)
	}

	await promiseSerial(customers.map(c => () => applyTagsToCustomer(c)))

	// Clear the caches after assigning new tags
	if (process.env.NODE_ENV !== 'development') {
		clearCache('customer')
		clearCache('order')
	}
}

run()
