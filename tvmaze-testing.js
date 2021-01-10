const showAPIData = {
    data: [
        {
            show: {
                id: 1,
                name: 'The show',
                summary: '<p>This was a good show and we remember it well</p>',
                image: {
                    original: '/big/image.jpeg',
                    medium: '/medium/image.jpeg'
                },
                foo: true
            }
        },
        {
            show: {
                id: 2,
                name: 'Bad show',
                summary: '<p>This show was banned for being bad</p>',
                foo: false
            }
        }
    ]
};

describe('searchShows takes a query and returns an array of show data objects', function() {

    it('Returns an array of objects when a query matches shows', async function() {
        const result = await searchShows('test');
        expect(result).toBeInstanceOf(Array);
        expect(result[0]).toBeInstanceOf(Object);
    });

    it('Returns an empty array when a query does not match any shows', async function() {
        const result = await searchShows('this is not a show name');
        expect(result).toBeInstanceOf(Array);
        expect(result.length).toEqual(0);
    });

    it("Returns a Promise when not called asynchronously", function() {
        expect(searchShows('error')).toBeInstanceOf(Promise);
    });

});

describe('createShowArray takes API show data and returns an array of objects with name, id, summary, and image properties', function() {

    it('Returns an array of objects from API data', function() {
        expect(createShowArray(showAPIData)).toBeInstanceOf(Array);
        expect(createShowArray(showAPIData)[0]).toBeInstanceOf(Object);
    });

    it('Each show object has only name, image, summary and id properties', function() {
        expect(createShowArray(showAPIData)[0].hasOwnProperty('name')).toBe(true);
        expect(createShowArray(showAPIData)[0].hasOwnProperty('image')).toBe(true);
        expect(createShowArray(showAPIData)[0].hasOwnProperty('summary')).toBe(true);
        expect(createShowArray(showAPIData)[0].hasOwnProperty('id')).toBe(true);
        expect(createShowArray(showAPIData)[0].hasOwnProperty('foo')).toBe(false);
    });

    it("Returns the medium image link if there is an image property, and a default image link if a show doesn't contain the image property", function(){
        expect(createShowArray(showAPIData)[0].image).toEqual('/medium/image.jpeg');
        expect(createShowArray(showAPIData)[1].image).toEqual('https://tinyurl.com/tv-missing');
    });
});

describe('populateShows adds items to the show list when a query returns results', function() {

    it('Creates show divs equal to the number of items returned from a successful query', async function() {
        const response1 = await searchShows('twin peaks');
        populateShows(response1);
        expect($('#shows-list').children().length).toBe(1);
        const response2 = await searchShows('deadwood');
        populateShows(response2);
        expect($('#shows-list').children().length).toBe(3);
    })

    it('Appends a message when there are no shows passed', function() {
        populateShows([]);
        expect($('#shows-list').children().eq(0).text()).toBe('No shows found with that term.');
    });

    it('Adds the show id as a data attribute to the parent div', function() {
        populateShows(createShowArray(showAPIData));
        expect($('#shows-list').children().eq(0).data('show-id')).toBe(1);
        expect($('#shows-list').children().eq(1).data('show-id')).toBe(2);
    });

    it('Sets the img src to the value of the image property of the show object', function() {
        const showArray = createShowArray(showAPIData);
        populateShows(showArray);
        expect($('.card-img-top').eq(0).attr('src')).toEqual(showArray[0].image);
        expect($('.card-img-top').eq(1).attr('src')).toEqual(showArray[1].image);
    });

    it('Sets the text of the card title to the name of the show', function() {
        const showArray = createShowArray(showAPIData);
        populateShows(showArray);
        expect($('.card-title').eq(0).text()).toEqual(showArray[0].name);
        expect($('.card-title').eq(1).text()).toEqual(showArray[1].name);
    });

    it('Sets the text of the card body to the summary of the show', function() {
        const showArray = createShowArray(showAPIData);
        populateShows(showArray);
        expect($('.card-text').eq(0).next().html()).toEqual($(showArray[0].summary).text());
        expect($('.card-text').eq(1).next().html()).toEqual($(showArray[1].summary).text());
    });

    afterEach(function() {
        $('#shows-list').empty();
    });
});