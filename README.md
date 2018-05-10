A node script to apply tags to customers who have purchased particular items.

Make copies of or rename `.env.example` and `config.example.js` to `.env` and `config.js`, and upate them with the appropriate values. To get API keys, go into your **Shopify admin > Config > Apps > Manage Private Apps**.

_Be sure to make a backup of your user data. This code shouldn't do anything other than **add** tags, but I'm not going to guarantee it won't mess up your information._

Do a dry run with `npm run dryrun`

Clear your cache with `npm run clear`

When you're sure it's working, `npm run tag`.
