const parse = (RSS) => {
    const newParser = new DOMParser();
    const data = newParser.parseFromString(RSS, 'text/xml');

    const errorNode = data.querySelector('parsererror');
    if (errorNode) {
        const errorText = errorNode.textContent;
        const parsingError = new Error(`XML parsing error: ${errorText}`);
        throw parsingError;
    }

    const titleNode = data.querySelector('channel > title');
    const flowTitle = titleNode ? titleNode.textContent.trim() : '';

    const descriptionNode = data.querySelector('channel > description');
    const flowDescription = descriptionNode ? descriptionNode.textContent.trim() : '';

    const itemElements = data.querySelectorAll('item');

    const posts = Array.from(itemElements).map((post) => {
        return {
            title: post.querySelector('title').textContent.trim(),
            description: post.querySelector('description'),
            link: post.querySelector('link'),
        }
    });
    console.log({ flowTitle, flowDescription, posts })
    return { flowTitle, flowDescription, posts };
};

export default parse;
