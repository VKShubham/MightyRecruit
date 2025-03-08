import moment from "moment";

export const isTodaydate = (date: Date) => {
const MomentDate = moment(date);
return  MomentDate.isSame(moment(), 'day');
}

