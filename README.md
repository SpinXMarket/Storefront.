# SpinX Storefront API

Secure bridge for the existing SpinX Discord bot.

1. Copy `.env.example` to `.env`.
2. Put the existing bot token ONLY in `.env`.
3. Set the channel ID for ⭐︱reviews.
4. Set the channel ID where website orders should be posted.
5. Deploy this Node.js API.
6. Put the deployed API URL into `window.SPINX_API_URL` in the storefront.

Endpoints:
- GET /health
- GET /reviews
- POST /orders

The review parser expects the review bot's embed fields to be named Rating/Stars,
Product/Product Purchased, and Review/Comment. Adjust the parser if your current
review bot uses different field names.
