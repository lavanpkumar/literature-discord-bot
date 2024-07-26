const { Client, Events, GatewayIntentBits } = require('discord.js')
const { token } = require('./config.json')
const cheerio = require('cheerio')


// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]})

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);

client.on('error', error => {
    console.error('Discord client encountered an error:', error);
});

const bookSummary = async (message) => {
    const query = message.content.slice(6);
    const search = await fetch(`https://www.goodreads.com/search?utf8=%E2%9C%93&query=${encodeURIComponent(query)}`);
    const searchText = await search.text();

    const $ = cheerio.load(searchText);
    const firstResult = $('.bookTitle').first().attr('href');

    if (firstResult) {
        const bookInfo = await fetch(`https://www.goodreads.com${firstResult}`);
        const bookInfoText = await bookInfo.text();

        const $$ = cheerio.load(bookInfoText);
        
        const bookTitle = $$('h1[data-testid="bookTitle"]').text().trim();
        const author = $$('span[data-testid="name"]').first().text().trim();
        const publishDate = $$('[data-testid="publicationInfo"]').text().trim();
        const synopsis = $$('[data-testid="description"]').text().trim();
        
        console.log("Extracted data:", { bookTitle, author, publishDate, synopsis });

        message.reply(`${bookTitle} by ${author} was ${publishDate}.`);
    } else {
        message.reply("Sorry, I couldn't find that book.");
    }


}

client.on("messageCreate", (message) => {
    try {
        if (message.content.startsWith('!book')) {
            bookSummary(message)
        }
    } catch (error) {
        console.error('Error handling message: ', error);
        message.reply("Sorry, an error occurred while searching for the book.");
    }
});




