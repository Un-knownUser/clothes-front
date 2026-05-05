import { Filter } from 'bad-words';
import russianBadWords from './badWordsList';

const baseFilter = new Filter({ placeHolder: '*' });

const filterBadWords = (text) => {
    if (!text) return text;

    let filteredText = baseFilter.clean(text);

    const russianPattern = new RegExp(`(${russianBadWords.join('|')})(?=[\\s.,!?;:()\\[\\]{}"«»]|$)`, 'gi');
    filteredText = filteredText.replace(russianPattern, (match) => '*'.repeat(match.length));

    return filteredText;
};

export default filterBadWords;
