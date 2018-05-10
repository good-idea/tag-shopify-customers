// const axios = require('axios')
const Shopify = require('shopify-api-node')
const fs = require('fs')
const debug = require('debug')('tag')
require('dotenv').config()

const client = new Shopify({
	shopName: process.env.API_SHOP_NAME,
	apiKey: process.env.API_KEY,
	password: process.env.API_SECRET,
})

const fetchItems = async type => {
	const items = []
	const limit = 250
	const fetch = async page => {
		debug(`Fetching ${type}s, page ${page}`)
		const typeParams = type === 'order' ? { status: 'any' } : {}
		const params = { limit, page, ...typeParams }
		const newItems = await client[type].list(params)
		items.push(...newItems)
		return newItems.length < limit ? items : fetch(page + 1)
	}
	return fetch(1)
}

const fetchCount = async type => {
	const params = type === 'order' ? { status: 'any' } : {}
	return client[type].count()
}

const loadCache = type => {
	try {
		const load = fs.readFileSync(`./caches/${type}.json`, 'utf8')
		return JSON.parse(load)
	} catch (e) {
		const message = e.toString()
		if (
			message.match('Unexpected end of JSON input') ||
			message.match('ENOENT') ||
			message.match('Unexpected token')
		) {
			return undefined
		} else {
			throw e
		}
	}
}

const writeCache = (type, data) => {
	fs.writeFileSync(`./caches/${type}.json`, JSON.stringify(data))
}

const clearCache = type => writeCache(type, '')

const getItems = async type => {
	debug(`Getting all ${type}s`)
	const count = await fetchCount(type)
	const cache = loadCache(type)
	debug(`   Count of ${type}s: ${count}`)
	debug(`   Count in cache: ${cache ? cache.length : 0}`)
	if (cache && count <= cache.length) {
		debug(`   Using the ${type} cache.`)
		return cache
	}
	debug(`   Fetching new ${type}s...`)
	const items = await fetchItems(type)
	debug(`   Fetched ${items.length} ${type}s.`)
	writeCache(type, items)
	debug(`   Saved ${type} to cache.`)
	return items
}

const sleep = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms))

const putItem = async (type, id, data) => {
	if (process.env.NODE_ENV === 'development') {
		debug(`   [dev mode, no changes were pushed]`)
		return data
	}
	const response = await client[type].update(id, data)
	await sleep(500) // This is to rate-limit your requests
	return response
}

module.exports = { getItems, putItem, clearCache }
