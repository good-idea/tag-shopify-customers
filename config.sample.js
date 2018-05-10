const itemsAndTags = [
	{
		// Customers who ordered any of the following items
		itemIds: [
			1321277288084,
			1335995497280,
			1107100635625,
			1336543510612,
			1336939165908,
			1336594118548,
		],
		// Get the following tags
		tags: ['VIP', 'High Spender'],
	},
	{
		itemIds: [1322192188692, 1335977145520],
		tags: ['VIP'],
	},
	{
		// Maybe you want to follow up with users who buy these items
		itemIds: [1324096816948, 1322368449588],
		tags: ['Follow up'],
	},
]

const tagMap = new Map()
itemsAndTags.map(({ itemIds, tags }) => itemIds.map(id => tagMap.set(id, tags)))

module.exports = { tagMap }
