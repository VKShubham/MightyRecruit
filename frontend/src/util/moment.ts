import moment from "moment"

export const daysAgo = (date : string) => {
    const givenDate = moment(date);
    const today = moment();
    return today.diff(givenDate, 'days');
}