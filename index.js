const { Client, Events, GatewayIntentBits } = require('discord.js')
const { token } = require('./config.json')
const cheerio = require('cheerio')
//const userRatings = new Map()

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]})

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(token);

client.on('error', error => {
    console.error('Discord client encountered an error:', error);
});

client.on("messageCreate", (message) => {
    try {
        if (message.content.startsWith('!book')) {
            bookSummary(message)
        }
        if (message.content.startsWith('!rate')) {
            rate(message)
        }
} catch (error) {
    console.error('Error handling message: ', error);
    message.reply("Sorry, an error occurred while searching for the book.");
}
});

/*
const rate = async (message) => {
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
        const goodreadsRating = $$('.RatingStatistics__rating').text().trim()

        if (!userRatings.has(bookTitle)) {
            userRatings.set(bookTitle, 0.0)
        }
        message.reply(`Goodreads Rating: ${goodreadsRating}\nYour Rating is: ${userRatings.get(bookTitle)}`)
    
    }    
}
*/

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
        const firstGenre = $$('.BookPageMetadataSection__genreButton').first().text().trim();
        const secondGenre = $$('.BookPageMetadataSection__genreButton').eq(1).text().trim();
        const thirdGenre = $$('.BookPageMetadataSection__genreButton').eq(2).text().trim();
        const synopsis = $$('[data-testid="description"]').text().trim();
        
        console.log("Extracted data:", { bookTitle, author, publishDate, firstGenre, secondGenre, thirdGenre, synopsis });

        const messageReply = `${bookTitle} by ${author} was ${publishDate}.\nGenres: ${firstGenre}, ${secondGenre}, ${thirdGenre}\nSynopsis: ${synopsis}`
        
        if (messageReply.length <= 2000) {
            message.reply(`${bookTitle} by ${author} was ${publishDate}.\nGenres: ${firstGenre}, ${secondGenre}, ${thirdGenre}\nSynopsis: ${synopsis}`);
        } else {
            message.reply(`${messageReply.slice(0,1997)}...`)
        }
    } else {
        message.reply("Sorry, I couldn't find that book.");
    }


}





