const setup = async() => {
    var blocks = document.querySelectorAll('.istock-block');
    const requirements = processBlocks(blocks);
    requirements.forEach(req => {
        var page = 1
        try {
            page = ACTUAL_PAGE
        } catch (e) {}
        getContents(req.keyword, req.keywordAleternative, req.totalAmount, page)
            .then(data => {
                var { contents, relateds, searchUrl } = data;
                const relatedsPerBlock = Math.floor(relateds.length / req.blocks.length);
                req.blocks.forEach(block => {
                    var childIndex = block.element.getAttribute('data-discount-coupon-enabled') === '1' ? 1 : 0;
                    var blockContents = contents.slice(0, block.amount);
                    contents = contents.slice(block.amount);
                    var blockRelateds = relateds.slice(0, relatedsPerBlock);
                    relateds = relateds.slice(relatedsPerBlock);
                    const showrelateds = block.showrelateds == '1';
                    blockContents.forEach(content => {
                        const imgSrc = getApropiateDisplaySize(content.display_sizes);
                        if(!imgSrc){
                            return;
                        }
                        const container = document.createElement("div");
                        const orientation = block.orientation;
                        container.classList.add(...['w-full', 'sm:w-1/2', 'md:w-1/3', 'float-left', 'p-2', 'relative', 'h-full']);
                        container.classList.add(orientation === 'vertical' ? 'lg:w-1/2' : 'lg:w-1/6')
                        const a = document.createElement("a");
                        a.href = content.referral_destinations[0] + "&sharedid=" + encodeURIComponent(block.shareid);
                        a.target = "_blank";
                        const span = document.createElement("span");
                        span.classList.add(...['relative', 'p-istock-elem', 'overflow-hidden', 'block', 'w-full', 'h-full']);
                        const img = document.createElement("img");
                        img.classList.add(...['absolute', 'top-0', 'bottom-0', 'left-0', 'object-cover', 'w-full', 'h-full']);
                        img.src = imgSrc;
                        span.appendChild(img);
                        a.appendChild(span);
                        container.appendChild(a);
                        block.element.getElementsByTagName('div')[childIndex].appendChild(container);
                    })
                    const viewMoreItem = buildViewMore(searchUrl);
                    block.element.getElementsByTagName('div')[childIndex].lastElementChild.firstChild.firstChild.appendChild(viewMoreItem);
                    if (showrelateds) {
                        let position = block.element.getAttribute('data-position')
                        const relatedsElement = buildRelateds(blockRelateds, position);
                        if (relatedsElement) {
                            block.element.parentElement.appendChild(relatedsElement);
                        }
                    }
                })
            })
    })
}

const getApropiateDisplaySize = (displaySizes) => {
    const options = ['comp', 'preview', 'mid_res_comp', 'high_res_comp', 'thumb'];
    for(option in options){
        var istockDisplaySizes = displaySizes.filter(el => el.name == options[option]);
        if (istockDisplaySizes.length > 0) {
            return istockDisplaySizes[0].uri;
        }
    }
    return false;
}

const buildRelateds = (relateds, position) => { 
    if (relateds.length <= 0) {
        return null;
    }
    const div = document.getElementById(`related-searches-${position}`)
    div.classList.add(...['my-2','px-2']);
    const p = document.createElement("p");
    p.innerHTML = 'Related searches: ';
    relateds.forEach((related, index) => {
        const a = document.createElement("a");
        a.classList.add(...['text-blue-500', 'hover:text-blue-700']);
        a.href = related.url;
        a.target = "_blank";
        a.innerHTML = related.phrase;
        p.appendChild(a);
        if (index < relateds.length - 1) {
            p.innerHTML += ', ';
        }
    })
    div.appendChild(p);
    return div;
}

const buildViewMore = (searchUrl) => {
    var a = document.createElement("a");
    var span = document.createElement("span");
    var p = document.createElement("p");
    a.href = searchUrl.replace('mediatype%3Dillustration', 'mediatype%3Dphotography');
    a.target = "_blank";
    p.innerHTML = 'View more';
    p.classList.add(...['text-white']);
    span.classList.add(...['z-10', 'view-more', 'absolute', 'top-0', 'right-0', 'w-full', 'h-full', 'bg-black', 'bg-opacity-60', 'flex', 'justify-center', 'items-center']);
    a.appendChild(span);
    span.appendChild(p);
    return a;
}

const processBlocks = (blocks) => {
    var requirements = {};
    blocks.forEach(block => {
        var keyword = block.getAttribute('data-keyword');
        var amount = block.getAttribute('data-amount');
        var orientation = block.getAttribute('data-orientation');
        var showrelateds = block.getAttribute('data-showrelateds');
        var keywordAleternative = block.getAttribute('data-keywordalternative');
        var shareid = block.getAttribute('data-shareid');
        keyword = keyword ? keyword : "";
        try {
            amount = amount ? parseInt(amount) : 10;
        } catch (e) {
            amount = 10;
        }
        const blockData = {
            amount,
            orientation,
            showrelateds,
            element: block,
            shareid,
        }
        if (requirements[keyword]) {
            requirements[keyword].totalAmount += amount;
            requirements[keyword].blocks.push(blockData);
        } else {
            requirements[keyword] = {
                totalAmount: amount,
                blocks: [blockData],
                keywordAleternative
            };
        }
    });
    var result = [];
    for (const [key, value] of Object.entries(requirements)) {
        result.push({
            keyword: key,
            totalAmount: value.totalAmount,
            blocks: value.blocks,
            keywordAleternative: value.keywordAleternative
        });
    }
    return result;
}

const getContents = async(keyword, keywordAleternative, amount, page = 1) => {
    const actualUrl = window.location.href;
    const firstFolder = actualUrl.split('/')[3];
    var lang = "";
    if (firstFolder && AVAILABLE_LANGUAGES_FOLDERS.includes(firstFolder)) {
        lang = firstFolder;
    } else {
        lang = "en-US";
    }

    var amountPerPage = 30;
    var neededPages = Math.ceil(amount / amountPerPage);

    var previousPage = page - 1;
    var actualPage = previousPage * neededPages;
    actualPage += 1

    var result = {
        contents: [],
        relateds: [],
        searchUrl: ''
    };
    var attempts = 0;
    while (result.contents.length < amount) {
        attempts++;
        if (attempts > 10) {
            break;
        }
        const params = new URLSearchParams({
            phrase: keyword,
            page: actualPage,
            page_size: amountPerPage,
            graphical_styles: 'photography',
            lang
        });
        var url = 'https://api.freeimages.com/istock/search/?' + params
        actualPage++;
        try {
            await fetch(url, { referrerPolicy: "origin" }).then(function(response) {
                return response.json();
            }).then(function(responseData) {
                var { error, data } = responseData;
                if (!error) {
                    result.contents.push(...data.results);
                    result.relateds.push(...data.related_searches);
                    result.searchUrl = data.search_url;
                }
                if(result.contents.length <= 0 && keywordAleternative){
                    keyword = keywordAleternative;
                }
            }).catch(function(err) {
                console.warn('Something went wrong.', err);
            });
        } catch (e) {
            console.warn('Something went wrong.', e);
        }
    }
    return result;
}

setup();