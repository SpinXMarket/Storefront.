SpinX Storefront v2

This package contains:
- spinx-store/index.html — updated storefront with checkout form and live-review hook.
- spinx-api/ — secure Node.js bridge for the existing Discord bot.

The website NEVER needs the Discord bot token.
The API keeps the token server-side and reads reviews from ⭐︱reviews.
Website orders are posted to the configured Discord orders channel.

The existing review bot can remain the bot that customers already use; this API
uses the same bot credentials rather than creating a second bot.
